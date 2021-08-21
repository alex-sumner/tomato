const { expect } = require("chai")

describe("KickFactory contract", function () {

    let hhTomato
    let owner
    let treasury
    let addr1
    let addr2
    let addrs
    
    const logger = ethers.utils.Logger.globalLogger()
    const fifty_thousand = "50000000000000000000000";
    const five_thousand = "5000000000000000000000";
    const initial_supply = fifty_thousand;
    
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
    
    it("should tax transfers at 2%", async function () {
        await hhTomato.connect(owner).mint(addr1.address, five_thousand)
        expect(await hhTomato.balanceOf(addr1.address)).to.equal(five_thousand)
        await hhTomato.connect(addr1).transfer(addr2.address, five_thousand)
        tax = ethers.BigNumber.from(five_thousand).div(50)
        expect(await hhTomato.balanceOf(treasury.address)).to.equal(ethers.BigNumber.from(initial_supply).add(tax))
        expect(await hhTomato.balanceOf(addr1.address)).to.equal(0)
        expect(await hhTomato.balanceOf(addr2.address)).to.equal(ethers.BigNumber.from(five_thousand).sub(tax))
    })

    it("should not tax transfers when turned off", async function () {
        await hhTomato.connect(owner).mint(addr1.address, five_thousand)
        await hhTomato.connect(owner).setTaxing(false)
        expect(await hhTomato.balanceOf(addr1.address)).to.equal(five_thousand)
        await hhTomato.connect(addr1).transfer(addr2.address, five_thousand)
        expect(await hhTomato.balanceOf(treasury.address)).to.equal(ethers.BigNumber.from(initial_supply))
        expect(await hhTomato.balanceOf(addr1.address)).to.equal(0)
        expect(await hhTomato.balanceOf(addr2.address)).to.equal(ethers.BigNumber.from(five_thousand))
    })

})
