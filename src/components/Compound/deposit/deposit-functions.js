import * as ethers from 'ethers';
export const wethAddress="0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

/**
 * Gets the balance of the native eth that the user has
 * @param currentWallet 
 * @param setEthUserBal 
 * @param ethUserBal 
 */
 export const getEthBalance = async(currentWallet, setEthUserBal, ethUserBal) => {
    const {ethereum} = window;
    try{
        if(ethereum){
            const provider = new ethers.providers.Web3Provider(ethereum);

            const balance = await provider.getBalance(currentWallet);
            const formattedBal = Number(ethers.utils.formatUnits(balance, 18));
            setEthUserBal(formattedBal);
        }
        else{
            console.log("Ethereum object doesn't exist!");
        }
    }
    catch(error){
        console.log(error);
    }
}


/**
 * Gets the balance of the lp tokens that the user has 
 * @param pool 
 * @param currentWallet 
 * @param setUserLPBalance 
 * @param userLPBalance 
 */
 export const getLPBalance = async(pool, currentWallet, setUserLPBalance, userLPBalance) => {
    const {ethereum} = window; 
    try {
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const lpContract = new ethers.Contract(pool.lp_address, pool.lp_abi, provider);

            const balance = await lpContract.balanceOf(currentWallet);
            const formattedBal = Number(ethers.utils.formatUnits(balance, 18));
            setUserLPBalance(formattedBal);
        }
        else {
            console.log("Ethereum object doesn't exist!");
        }
    }
    catch (error){
        console.log(error);
    }
}

/**
 * Zaps ETH into the Vault
 * @param {*} setLoading 
 * @param {*} pool 
 * @param {*} ethZapAmount 
 * @param {*} wethAddress 
 * @param {*} setEthZapAmount 
 */
export const zapIn = async(setLoading, pool, ethZapAmount, setEthZapAmount, setLoaderMessage) => {
    const {ethereum} = window;
    setLoading(true);
    setLoaderMessage('User initiated a zap into the vault!')
    try{
        if(ethereum){
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const zapperContract = new ethers.Contract(pool.zapper_addr, pool.zapper_abi, signer); 

            /*
            * Execute the actual deposit functionality from smart contract
            */
            const formattedBal = ethers.utils.parseUnits(ethZapAmount.toString(), 18);
    
            const gasEstimated = await zapperContract.estimateGas.zapInETH(pool.vault_addr, formattedBal, wethAddress, {value:formattedBal});
            const gasMargin = gasEstimated * 1.1; 
            
            const zapperTxn = await zapperContract.zapInETH(pool.vault_addr, formattedBal, wethAddress, {value:formattedBal, gasLimit: Math.ceil(gasMargin)});

            setLoaderMessage(`Zapping... ${zapperTxn.hash}`);

            const zapperTxnStatus = await zapperTxn.wait(1);
            if (!zapperTxnStatus.status) {
                setLoaderMessage('Error zapping into the vault'); 
            }else{
                setLoaderMessage(`Deposited -- ${zapperTxn.hash}`);
                setEthZapAmount(0.0); 
            }
        }
        else{
            console.log("Zapper object doesn't exist!")
        }

    }catch(error){
        console.log(error);
        setLoaderMessage(error + "Try again!"); 
    }
    finally {
        setLoading(false);
        setLoaderMessage('');
    }
}

/**
 * Deposits LP token into the vault
 * @param {*} pool 
 * @param {*} depositAmount 
 * @param {*} setLPDepositAmount 
 * @param {*} setLoading 
 */
export const deposit = async(pool, depositAmount, setLPDepositAmount, setLoading, setLoaderMessage) => {
    
    const {ethereum} = window;
    setLoading(true);
    setLoaderMessage('User initiated a deposit into the vault!'); 
    try{
        if(ethereum){
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const vaultContract = new ethers.Contract(pool.vault_addr, pool.vault_abi, signer);
            
            /*
            * Execute the actual deposit functionality from smart contract
            */
            const formattedBal = ethers.utils.parseUnits(depositAmount.toString(), 18);

            // approve the vault to spend asset
            const lpContract = new ethers.Contract(pool.lp_address, pool.lp_abi, signer);
            await lpContract.approve(pool.vault_addr, formattedBal);

            const gasEstimated = await vaultContract.estimateGas.deposit(formattedBal);
            const gasMargin = gasEstimated * 1.1;


            //the abi of the vault contract needs to be checked 
            const depositTxn = await vaultContract.deposit(formattedBal, {gasLimit: Math.ceil(gasMargin)});
            // const gasPrice = await provider.getGasPrice();
            // const depositTxn = await vaultContract.deposit(formattedBal, {gasLimit: gasPrice});
           
            setLoaderMessage(`Depositing... ${depositTxn.hash}`)

            const depositTxnStatus = await depositTxn.wait(1);
            if (!depositTxnStatus.status) {
                setLoaderMessage(`Error depositing into vault!`)
            }else{
                setLoaderMessage(`Deposited-- ${depositTxn.hash}`)
                setLPDepositAmount(0.0);
            }
            
        }else {
            console.log("Ethereum object doesn't exist!");
        }
    }catch (error) {
        console.log(error);
        setLoaderMessage(error + "Try again!")
    }
    finally {
        setLoading(false);
    }

}