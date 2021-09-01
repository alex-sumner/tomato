const { expect } = require("chai")

describe("ICO contract", function () {

    let hhIco
    let owner
    let treasury
    let alice
    let bob
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
        ;[owner, treasury, alice, bob, ...addrs] = await ethers.getSigners()
        hhIco = await Ico.deploy(treasury.address)
        await hhIco.deployed()
    })

    it("should start in seed phase", async function () {
        expect(await hhIco.connect(bob).currentPhaseDesc()).to.equal("seed")
    })

    it("should only allow owner to approve investors", async function () {
        await expect(hhIco.connect(bob).addApprovedInvestor(alice.address)).to.be.revertedWith("Must be owner")
    })

    it("should accept contributions from approved investors", async function () {
        await hhIco.connect(owner).addApprovedInvestor(alice.address)
        await hhIco.connect(alice).contribute({value: one})
        expect(await hhIco.connect(owner).getContribution(alice.address)).to.equal(one)
    })

    it("should not accept contributions of less than 0.01 eth", async function () {
        await expect(hhIco.connect(alice).contribute({value: one_thousandth})).to.be.revertedWith("Contribution must be at least 0.01 ETH.")
    })

    it("should only allow owner to pause fundraising", async function () {
        await expect(hhIco.connect(alice).setPaused(true)).to.be.revertedWith("Must be owner")
    })

    it("should not accept contributions when paused", async function () {
        await hhIco.connect(owner).setPaused(true)
        await expect(hhIco.connect(alice).contribute({value: one})).to.be.revertedWith("Fundraising is paused.")
    })

    it("should not accept contributions from non-approved investors during seed phase", async function () {
        await expect(hhIco.connect(alice).contribute({value: one})).to.be.revertedWith("Approved investors only during seed phase.")
    })

    it("should not accept contributions from no longer approved investors during seed phase", async function () {
        await hhIco.connect(owner).addApprovedInvestor(alice.address)
        await hhIco.connect(alice).contribute({value: one})
        await hhIco.connect(owner).removeApprovedInvestor(alice.address)
        await expect(hhIco.connect(alice).contribute({value: one})).to.be.revertedWith("Approved investors only during seed phase.")
        expect(await hhIco.connect(owner).getContribution(alice.address)).to.equal(one)
    })

    it("should not accept contributions above individual seed limit", async function () {
        await hhIco.connect(owner).addApprovedInvestor(alice.address)
        await expect(hhIco.connect(alice).contribute({value: five_thousand})).to.be.revertedWith("Max individual seed contribution is 1,500")
        expect(await hhIco.connect(owner).getContribution(alice.address)).to.equal(0)
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

    it("should allow owner to change phase", async function () {
        expect(await hhIco.connect(bob).currentPhase()).to.equal(0)
        expect(await hhIco.connect(bob).currentPhaseDesc()).to.equal("seed")
        await hhIco.connect(owner).moveToGeneral()
        expect(await hhIco.connect(bob).currentPhase()).to.equal(1)
        expect(await hhIco.connect(bob).currentPhaseDesc()).to.equal("general")
        await hhIco.connect(owner).moveToOpen()
        expect(await hhIco.connect(bob).currentPhase()).to.equal(2)
        expect(await hhIco.connect(bob).currentPhaseDesc()).to.equal("open")
    })

    it("should only allow owner to change phase", async function () {
        await expect(hhIco.connect(alice).moveToGeneral()).to.be.revertedWith("Must be owner")
    })

    it("should accept contributions from non-approved investors after seed phase", async function () {
        await hhIco.connect(owner).moveToGeneral()
        await hhIco.connect(alice).contribute({value: one})
        expect(await hhIco.connect(owner).getContribution(alice.address)).to.equal(one)
    })

    it("should not accept contributions above individual general limit", async function () {
        await hhIco.connect(owner).moveToGeneral()
        await expect(hhIco.connect(alice).contribute({value: five_thousand})).to.be.revertedWith("Max individual contribution is 1,000")
        expect(await hhIco.connect(owner).getContribution(alice.address)).to.equal(0)
    })

    it("should accept contributions above individual limit during open phase", async function () {
        await hhIco.connect(owner).moveToGeneral()
        await hhIco.connect(owner).moveToOpen()
        await hhIco.connect(alice).contribute({value: five_thousand})
        expect(await hhIco.connect(owner).getContribution(alice.address)).to.equal(five_thousand)
    })

    it("should not accept contributions above total limit", async function () {
        for (let i=1; i<11; i++) {
            addr = addrs[i]
            await hhIco.connect(owner).addApprovedInvestor(addr.address)
            await hhIco.connect(addr).contribute({value: one_thousand_five_hundred})
        }
        await hhIco.connect(owner).moveToGeneral()
        for (let i=11; i<14; i++) {
            addr = addrs[i]
            await hhIco.connect(addr).contribute({value: one_thousand})
        }
        await hhIco.connect(owner).moveToOpen()
        await hhIco.connect(addrs[14]).contribute({value: six_thousand})
        await hhIco.connect(addrs[15]).contribute({value: six_thousand})
        await expect(hhIco.connect(alice).contribute({value: one})).to.be.revertedWith("Max contribution exceeded")
    })

    it("should allow redemption on entering open phase", async function () {
        await hhIco.connect(owner).moveToGeneral()
        await hhIco.connect(alice).contribute({value: one_thousand})
        await hhIco.connect(bob).contribute({value: three_hundred})
        await hhIco.connect(owner).moveToOpen()
        await hhIco.connect(alice).redeem();
        const Tomato = await ethers.getContractFactory("Tomato")
        const hhTomato = await Tomato.attach(await hhIco.tomato())
        expect(await hhIco.connect(owner).getContribution(alice.address)).to.equal(0)
        expect(await hhTomato.connect(owner).balanceOf(alice.address)).to.equal(five_thousand)
        expect(await hhIco.connect(owner).getContribution(bob.address)).to.equal(three_hundred)
        expect(await hhTomato.connect(owner).balanceOf(bob.address)).to.equal(0)
    })

    it("should allow redemption of contributions made after entering open phase", async function () {
        await hhIco.connect(owner).moveToGeneral()
        await hhIco.connect(alice).contribute({value: one_thousand})
        await hhIco.connect(owner).moveToOpen()
        await hhIco.connect(alice).redeem();
        await expect(hhIco.connect(bob).redeem()).to.be.revertedWith("Nothing to redeem");
        await hhIco.connect(bob).contribute({value: three_hundred})
        await hhIco.connect(bob).redeem();
        const Tomato = await ethers.getContractFactory("Tomato")
        const hhTomato = await Tomato.attach(await hhIco.tomato())
        expect(await hhTomato.connect(alice).balanceOf(alice.address)).to.equal(five_thousand)
        expect(await hhTomato.connect(bob).balanceOf(bob.address)).to.equal(one_thousand_five_hundred)
    })

    it("should only allow redemption of each contribution once", async function () {
        await hhIco.connect(owner).moveToGeneral()
        await hhIco.connect(alice).contribute({value: one_thousand})
        await hhIco.connect(owner).moveToOpen()
        await hhIco.connect(alice).redeem();
        const Tomato = await ethers.getContractFactory("Tomato")
        const hhTomato = await Tomato.attach(await hhIco.tomato())
        expect(await hhTomato.connect(owner).balanceOf(alice.address)).to.equal(five_thousand)
        await expect(hhIco.connect(alice).redeem()).to.be.revertedWith("Nothing to redeem");
        await hhIco.connect(alice).contribute({value: three_hundred})
        await hhIco.connect(alice).redeem();
        expect(await hhTomato.connect(alice).balanceOf(alice.address)).to.equal(six_thousand_five_hundred)
    })

})
