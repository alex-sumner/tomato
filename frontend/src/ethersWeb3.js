import { ethers } from "ethers"
import IcoJSON from '/artifacts/contracts/Ico.sol/IcoJson.js'
import TomatoJSON from '/artifacts/contracts/Tomato.sol/TomatoJson.js'


const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()

const icoAddr = '0x5545A2c2Ab093615E1DcF727A7699AA5d06b8fCa'
const contract = new ethers.Contract(icoAddr, IcoJSON.abi, provider)
const tomatoAddr = contract.tomato()
const coins = new ethers.Contract(tomatoAddr, TomatoJSON.abi, provider)

window.provider = provider
window.signer = signer
window.contract = contract
window.coins = coins
window.utils = ethers.utils

export const connect = async () => {
    try {
        await signer.getAddress()
    } catch {
        await provider.send('eth_requestAccounts', [])
    }
}

export const phase = async () => {
    return await contract.currentPhaseDesc()
}


const contributions = async () => {
    return utils.formatEther(await contract.contributions(await signer.getAddress()))
}

const tokens = async () => {
    return utils.formatEther(await coins.balanceOf(await signer.getAddress()))
}

// window.onload = (event) => {
//     connect()
//     phase().then(value => phaseMsg.innerText = `Currently in ${value} phase`)
//     contributions().then(value => contributionsMsg.innerText = `You have contributed ${value} ETH`)
//     tokens().then(value => tokensHeldMsg.innerText = `You have ${value} tomatoes`)
// }

//getGreeting.addEventListener('click', async () => {})

