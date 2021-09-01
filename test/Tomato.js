const { expect } = require("chai")

describe("Tomato token contract", function () {

    let hhTomato
    let owner
    let treasury
    let addr1
    let addr2
    let addrs
    
    const logger = ethers.utils.Logger.globalLogger()
    const five_hundred_thousand = "500000000000000000000000"
    const fifty_thousand = "50000000000000000000000"
    const five_thousand = "5000000000000000000000"
    const initial_supply = fifty_thousand;
    const supply_cap = five_hundred_thousand
    
    beforeEach(async function () {
        Tomato = await ethers.getContractFactory("Tomato")
        ;[owner, treasury, addr1, addr2, ...addrs] = await ethers.getSigners()
        hhTomato = await Tomato.deploy(treasury.address)
    })

    it("should start with total supply of 50,000", async function () {
        expect(await hhTomato.totalSupply()).to.equal(fifty_thousand)
    })

    it("should start with treasury allocation of 50,000", async function () {
        expect(await hhTomato.balanceOf(treasury.address)).to.equal(fifty_thousand)
    })

    it("should be able to mint", async function () {
        await hhTomato.connect(owner).mint(addr1.address, five_thousand)
        expect(await hhTomato.balanceOf(addr1.address)).to.equal(five_thousand)
    })
    
    it("should not tax transfers by default", async function () {
        await hhTomato.connect(owner).mint(addr1.address, five_thousand)
        expect(await hhTomato.balanceOf(addr1.address)).to.equal(five_thousand)
        await hhTomato.connect(addr1).transfer(addr2.address, five_thousand)
        expect(await hhTomato.balanceOf(treasury.address)).to.equal(ethers.BigNumber.from(initial_supply))
        expect(await hhTomato.balanceOf(addr1.address)).to.equal(0)
        expect(await hhTomato.balanceOf(addr2.address)).to.equal(ethers.BigNumber.from(five_thousand))
    })

    it("should tax transfers at 2% when turned on", async function () {
        await hhTomato.connect(owner).mint(addr1.address, five_thousand)
        expect(await hhTomato.balanceOf(addr1.address)).to.equal(five_thousand)
        await hhTomato.connect(owner).setTaxing(true)
        await hhTomato.connect(addr1).transfer(addr2.address, five_thousand)
        tax = ethers.BigNumber.from(five_thousand).div(50)
        expect(await hhTomato.balanceOf(treasury.address)).to.equal(ethers.BigNumber.from(initial_supply).add(tax))
        expect(await hhTomato.balanceOf(addr1.address)).to.equal(0)
        expect(await hhTomato.balanceOf(addr2.address)).to.equal(ethers.BigNumber.from(five_thousand).sub(tax))
    })

    it("should not exceed total supply cap", async function () {
        const remainingSupply = ethers.BigNumber.from(supply_cap).sub(ethers.BigNumber.from(initial_supply))
        await hhTomato.connect(owner).mint(addr1.address, remainingSupply)
        expect(await hhTomato.balanceOf(addr1.address)).to.equal(remainingSupply)
        await expect(hhTomato.connect(owner).mint(addr2.address, 1)).to.be.revertedWith("Supply cap exceeded")
    })
})
