const { expect } = require("chai")

describe("ICO contract", function () {

    let hhIco
    let owner
    let addr1
    let addr2
    let addrs
    
    const logger = ethers.utils.Logger.globalLogger()
    const five_hundred_thousand = "500000000000000000000000"
    const fifty_thousand = "50000000000000000000000"
    const five_thousand = "5000000000000000000000"
    const initial_supply = fifty_thousand;
    const total_supply = five_hundred_thousand
    
    beforeEach(async function () {
        Ico = await ethers.getContractFactory("Ico")
        ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()
        hhIco = await Ico.deploy(treasury.address)
    })

    it("should ", async function () {
        //expect(await hhIco.??()).to.equal(??)
    })

})
