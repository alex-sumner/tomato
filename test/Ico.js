const { expect } = require("chai")

describe("ICO contract", function () {

    let hhIco
    let owner
    let treasury
    let addr1
    let addr2
    let addrs
    
    const logger = ethers.utils.Logger.globalLogger()
    const six_thousand = ethers.utils.parseEther("6000")
    const five_thousand = ethers.utils.parseEther("5000")
    const six_thousand_five_hundred = ethers.utils.parseEther("6500")
    const one_thousand_five_hundred = ethers.utils.parseEther("1500")
    const one_thousand = ethers.utils.parseEther("1000")
    const three_hundred = ethers.utils.parseEther("300")
    const one = ethers.utils.parseEther("1")
    const one_thousandth = ethers.utils.parseEther("0.001")
    
    const seed_individual_limit = one_thousand_five_hundred
    
    beforeEach(async function () {
        Ico = await ethers.getContractFactory("Ico")
        ;[owner, treasury, addr1, addr2, ...addrs] = await ethers.getSigners()
        hhIco = await Ico.deploy(treasury.address)
    })

    it("should only allow owner to approve investors", async function () {
        await expect(hhIco.connect(addr2).addApprovedInvestor(addr1.address)).to.be.revertedWith("Must be owner")
    })

    it("should accept contributions from approved investors", async function () {
        await hhIco.connect(owner).addApprovedInvestor(addr1.address)
        await hhIco.connect(addr1).contribute({value: one})
        expect(await hhIco.connect(owner).getContribution(addr1.address)).to.equal(one)
    })

    it("should not accept contributions of less than 0.01 eth", async function () {
        await expect(hhIco.connect(addr1).contribute({value: one_thousandth})).to.be.revertedWith("Contribution must be at least 0.01 ETH.")
    })

    it("should only allow owner to pause fundraising", async function () {
        await expect(hhIco.connect(addr1).setPaused(true)).to.be.revertedWith("Must be owner")
    })

    it("should not accept contributions when paused", async function () {
        await hhIco.connect(owner).setPaused(true)
        await expect(hhIco.connect(addr1).contribute({value: one})).to.be.revertedWith("Fundraising is paused.")
    })

    it("should not accept contributions from non-approved investors during seed phase", async function () {
        await expect(hhIco.connect(addr1).contribute({value: one})).to.be.revertedWith("Approved investors only during seed phase.")
    })

    it("should not accept contributions from no longer approved investors during seed phase", async function () {
        await hhIco.connect(owner).addApprovedInvestor(addr1.address)
        await hhIco.connect(addr1).contribute({value: one})
        await hhIco.connect(owner).removeApprovedInvestor(addr1.address)
        await expect(hhIco.connect(addr1).contribute({value: one})).to.be.revertedWith("Approved investors only during seed phase.")
        expect(await hhIco.connect(owner).getContribution(addr1.address)).to.equal(one)
    })

    it("should not accept contributions above individual seed limit", async function () {
        await hhIco.connect(owner).addApprovedInvestor(addr1.address)
        await expect(hhIco.connect(addr1).contribute({value: five_thousand})).to.be.revertedWith("Max individual seed contribution is 1,500")
        expect(await hhIco.connect(owner).getContribution(addr1.address)).to.equal(0)
    })

    it("should not accept contributions above total seed limit", async function () {
        for (let i=2; i<12; i++) {
            addr = addrs[i]
            await hhIco.connect(owner).addApprovedInvestor(addr.address)
            await hhIco.connect(addr).contribute({value: one_thousand_five_hundred})
        }
        await hhIco.connect(owner).addApprovedInvestor(addrs[12].address)
        await expect(hhIco.connect(addrs[12]).contribute({value: one})).to.be.revertedWith("Max seed contribution exceeded")
    })

    it("should only allow owner to change phase", async function () {
        await expect(hhIco.connect(addr1).moveToNextPhase()).to.be.revertedWith("Must be owner")
    })

    it("should accept contributions from non-approved investors after seed phase", async function () {
        await hhIco.connect(owner).moveToNextPhase()
        await hhIco.connect(addr1).contribute({value: one})
        expect(await hhIco.connect(owner).getContribution(addr1.address)).to.equal(one)
    })

    it("should not accept contributions above individual general limit", async function () {
        await hhIco.connect(owner).moveToNextPhase()
        await expect(hhIco.connect(addr1).contribute({value: five_thousand})).to.be.revertedWith("Max individual contribution is 1,000")
        expect(await hhIco.connect(owner).getContribution(addr1.address)).to.equal(0)
    })

    it("should accept contributions above individual limit during open phase", async function () {
        await hhIco.connect(owner).moveToNextPhase()
        await hhIco.connect(owner).moveToNextPhase()
        await hhIco.connect(addr1).contribute({value: five_thousand})
        expect(await hhIco.connect(owner).getContribution(addr1.address)).to.equal(five_thousand)
    })

    it("should not accept contributions above total limit", async function () {
        for (let i=1; i<11; i++) {
            addr = addrs[i]
            await hhIco.connect(owner).addApprovedInvestor(addr.address)
            await hhIco.connect(addr).contribute({value: one_thousand_five_hundred})
        }
        await hhIco.connect(owner).moveToNextPhase()
        for (let i=11; i<14; i++) {
            addr = addrs[i]
            await hhIco.connect(addr).contribute({value: one_thousand})
        }
        await hhIco.connect(owner).moveToNextPhase()
        await hhIco.connect(addrs[14]).contribute({value: six_thousand})
        await hhIco.connect(addrs[15]).contribute({value: six_thousand})
        await expect(hhIco.connect(addr1).contribute({value: one})).to.be.revertedWith("Max contribution exceeded")
    })

    it("should mint on entering open phase", async function () {
        await hhIco.connect(owner).moveToNextPhase()
        await hhIco.connect(addr1).contribute({value: one_thousand})
        await hhIco.connect(addr2).contribute({value: three_hundred})
        await hhIco.connect(owner).moveToNextPhase()
        const Tomato = await ethers.getContractFactory("Tomato")
        const hhTomato = await Tomato.attach(await hhIco.tomato())
        expect(await hhTomato.connect(owner).balanceOf(addr1.address)).to.equal(five_thousand)
        expect(await hhTomato.connect(owner).balanceOf(addr2.address)).to.equal(one_thousand_five_hundred)
    })

    it("should mint after entering open phase", async function () {
        await hhIco.connect(owner).moveToNextPhase()
        await hhIco.connect(addr1).contribute({value: one_thousand})
        await hhIco.connect(owner).moveToNextPhase()
        await hhIco.connect(addr2).contribute({value: three_hundred})
        const Tomato = await ethers.getContractFactory("Tomato")
        const hhTomato = await Tomato.attach(await hhIco.tomato())
        expect(await hhTomato.connect(owner).balanceOf(addr1.address)).to.equal(five_thousand)
        expect(await hhTomato.connect(owner).balanceOf(addr2.address)).to.equal(one_thousand_five_hundred)
    })

    it("should only mint each contribution once", async function () {
        await hhIco.connect(owner).moveToNextPhase()
        await hhIco.connect(addr1).contribute({value: one_thousand})
        await hhIco.connect(owner).moveToNextPhase()
        const Tomato = await ethers.getContractFactory("Tomato")
        const hhTomato = await Tomato.attach(await hhIco.tomato())
        expect(await hhTomato.connect(owner).balanceOf(addr1.address)).to.equal(five_thousand)
        await hhIco.connect(addr1).contribute({value: three_hundred})
        expect(await hhTomato.connect(owner).balanceOf(addr1.address)).to.equal(six_thousand_five_hundred)
    })

})
