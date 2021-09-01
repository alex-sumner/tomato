const { expect } = require("chai")

describe("TomatoPool contract", function () {

    let hhPool
    let hhTomato
    let ico
    let treasury
    let alice
    let bob
    let addrs
    
    const logger = ethers.utils.Logger.globalLogger()
    const twenty_five_thousand = ethers.utils.parseEther("25000")
    const eleven_thousand_one_hundred_and_eighty = ethers.utils.parseEther("11180")
    const six_thousand_five_hundred = ethers.utils.parseEther("6500")
    const six_thousand = ethers.utils.parseEther("6000")
    const five_thousand = ethers.utils.parseEther("5000")
    const one_thousand_five_hundred = ethers.utils.parseEther("1500")
    const one_thousand = ethers.utils.parseEther("1000")
    const three_hundred = ethers.utils.parseEther("300")
    const one = ethers.utils.parseEther("1")
    const one_thousandth = ethers.utils.parseEther("0.001")
    
    const seed_individual_limit = one_thousand_five_hundred
    
    beforeEach(async function () {
        ;[ico, treasury, alice, bob, ...addrs] = await ethers.getSigners()
        Tomato = await ethers.getContractFactory("Tomato")
        hhTomato = await Tomato.deploy(treasury.address)
        await hhTomato.deployed()
        TomatoPool = await ethers.getContractFactory("TomatoPool")
        hhPool = await TomatoPool.deploy(hhTomato.address, ico.address, treasury.address)
        await hhPool.deployed()
    })

    it("should accept ICO deposits from ICO", async function () {
        await hhTomato.mint(hhPool.address, 15)
        await hhPool.icoDeposit({value: 5})
    })

    it("should accept ICO deposits only from ICO", async function () {
        await hhTomato.mint(hhPool.address, 15)
        await expect(hhPool.connect(bob).icoDeposit({value: 5})).to.be.revertedWith("ICO only")
    })
    
    it("should accept normal deposits from anyone", async function () {
        await hhTomato.mint(hhPool.address, 15)
        await hhPool.connect(bob).deposit({value: 5})
    })

    it("should not accept deposits with no ETH", async function () {
        await hhTomato.mint(hhPool.address, 15)
        await expect(hhPool.connect(bob).deposit()).to.be.revertedWith("no ETH supplied")
    })
    
    it("should not accept deposits with no tomatoes", async function () {
        await expect(hhPool.connect(bob).deposit({value: 5})).to.be.revertedWith("no Tomato coins supplied")
    })
    
    it("should award liquidity tokens", async function () {
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("25"))
        await hhPool.icoDeposit({value: ethers.utils.parseEther("5")})
        expect((await hhPool.balanceOf(treasury.address)).div(one)).to.equal(11)
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("25"))
        await hhPool.connect(alice).deposit({value: ethers.utils.parseEther("5")})
        expect((await hhPool.balanceOf(alice.address)).div(one)).to.equal(11)
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("50"))
        await hhPool.connect(bob).deposit({value: ethers.utils.parseEther("10")})
        expect((await hhPool.balanceOf(bob.address)).div(one)).to.equal(22)
    })

    it("should allow withdrawal of liquidity", async function () {
        let initialAliceBalance = await ethers.provider.getBalance(alice.address)
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("25"))
        await hhPool.icoDeposit({value: ethers.utils.parseEther("5")})
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("25"))
        expect(await hhPool.connect(alice).deposit({value: ethers.utils.parseEther("5")}))
            .to.changeEtherBalance(alice, ethers.utils.parseEther("-5"))
        await expect(hhPool.connect(alice).withdraw()).to.be.revertedWith("insufficient liquidity burned")
        let aliceBalance = hhPool.balanceOf(alice.address)
        await hhPool.connect(alice).transfer(hhPool.address, aliceBalance)
        expect(await hhTomato.balanceOf(alice.address)).to.equal(0)
        expect(await hhPool.connect(alice).withdraw())
            .to.changeEtherBalance(alice, ethers.utils.parseEther("5"))
        expect(await hhTomato.balanceOf(alice.address)).to.equal(ethers.utils.parseEther("25"))
        let finalAliceBalance = await ethers.provider.getBalance(alice.address)
        expect(finalAliceBalance).to.be.closeTo(initialAliceBalance, ethers.utils.parseEther("0.06"))
        expect(finalAliceBalance).to.be.lt(initialAliceBalance)
    })

    it("should trade tomatoes for eth", async function () {
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("25"))
        await hhPool.icoDeposit({value: ethers.utils.parseEther("5")})
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("25"))
        await hhPool.connect(alice).deposit({value: ethers.utils.parseEther("5")})
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("5"))
        let initialBobBalance = await ethers.provider.getBalance(bob.address)
        await hhPool.connect(bob).swap()
        let finalBobBalance = await ethers.provider.getBalance(bob.address)
        expect(finalBobBalance.sub(initialBobBalance)).to.be.closeTo(ethers.utils.parseEther("0.9"), ethers.utils.parseEther("0.04"))
    })

    it("should trade eth for tomatoes", async function () {
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("500"))
        await hhPool.icoDeposit({value: ethers.utils.parseEther("100")})
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("500"))
        await hhPool.connect(alice).deposit({value: ethers.utils.parseEther("100")})
        await hhPool.connect(bob).swap({value: ethers.utils.parseEther("1")})
        let bobTomatoes = await hhTomato.balanceOf(bob.address)
        expect(bobTomatoes).to.be.closeTo(ethers.utils.parseEther("4.9"), ethers.utils.parseEther("0.04"))
    })

    it("should reject trades with slippage > 10%s", async function () {
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("25"))
        await hhPool.icoDeposit({value: ethers.utils.parseEther("5")})
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("25"))
        await hhPool.connect(alice).deposit({value: ethers.utils.parseEther("5")})
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("45"))
        await expect(hhPool.connect(bob).swap()).to.be.revertedWith("slippage is over 10%")
    })

    it("should charge fees on trades", async function () {
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("25"))
        await hhPool.icoDeposit({value: ethers.utils.parseEther("5")})
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("25"))
        await hhPool.connect(alice).deposit({value: ethers.utils.parseEther("5")})
        await hhTomato.mint(hhPool.address, ethers.utils.parseEther("5"))
        let initialTreasuryBalance = await ethers.provider.getBalance(treasury.address)
        await hhPool.connect(bob).swap()
        let finalTreasuryBalance = await ethers.provider.getBalance(treasury.address)
        expect(finalTreasuryBalance.sub(initialTreasuryBalance)).to.be.closeTo(ethers.utils.parseEther("0.009"), ethers.utils.parseEther("0.0004"))
    })

})
