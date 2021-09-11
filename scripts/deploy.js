async function main() {
    const [deployer] = await ethers.getSigners();
    const addrs = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Ico = await ethers.getContractFactory("Ico")
    const ico = await Ico.deploy(deployer.address)


    console.log("Ico address:", ico.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
