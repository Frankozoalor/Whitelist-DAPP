import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import styles from '../styles/Home.module.css';
import web3Modal from "web3modal";
import { providers } from 'ethers';
import { Contract } from 'ethers';
import { abi, WHITELIST_CONTRACT_ADDRESS } from '../constants';

export default function Home() {
  
  const [walletConnected, setWalletConnected] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async(needSigner = false) => {
    try{
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const {chainId} = await web3Provider.getNetwork();
      if(chainId !== 4){
        window.alert("Change the network to Rinkeby");
        throw new Error("Change the network to Rinkeby");
      }
      if(needSigner){
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider

    } catch(err){
      console.error(err);
    }
  }

      const addAddressToWhitelist= async () => {
        try {
          const signer = await getProviderOrSigner(true);
          const whitelistContract = new Contract(
          WHITELIST_CONTRACT_ADDRESS,
          abi,
          signer
          );
          const tx = await whitelistContract.addAddressToWhitelist();
          setLoading(true);
          await tx.wait();
          setLoading(false);
          await getNumberOfWhitelisted();
          setJoinedWhitelist(true);
        } catch(err){
          console.error(err);
        }
      };    

      const checkIfAddressIsWhitelisted = async() => {

      try{
        const signer = getProviderOrSigner(true);
        const whitelistContract = new Contract(
          WHITELIST_CONTRACT_ADDRESS,
          abi,
          signer
        );
        const address = await signer.getAddress();
        const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
        setJoinedWhitelist(_joinedWhitelist);
      } catch(err){
        console.error(err);
      }
    }

    const getNumberOfWhitelisted = async () => {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // No need for the Signer here, as we are only reading state from the blockchain
        const provider = await getProviderOrSigner();
        // We connect to the Contract using a Provider, so we will only
        // have read-only access to the Contract
        const whitelistContract = new Contract(
          WHITELIST_CONTRACT_ADDRESS,
          abi,
          provider
        );
        // call the numAddressesWhitelisted from the contract
        const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
        setNumberOfWhitelisted(_numberOfWhitelisted);
      } catch (err) {
        console.error(err);
      }
    };

     const renderButton = () => {
       if(walletConnected){
         if(joinedWhitelist){
           return <div className={styles.description}> Thanks for joining the Whitelist</div>;
         } else if(loading) {
           return (
             <button className={styles.button}> loading</button>
           )
         }
          else{
           return (
             <button onClick={addAddressToWhitelist}
                     className={styles.button}> Join the Whitelist
            </button>
           );
         }
       } else {
         <button onClick={connectWallet} className={styles.button}>
           Connect your wallet
         </button>
       }
     };
   
    const connectWallet = async() => {
    try{
      await getProviderOrSigner();
      setWalletConnected(true);
      checkIfAddressIsWhitelisted();
      getNumberOfWhitelisted()
    } catch(err){
      console.error(err);
    }
  }

    useEffect(() => {
    if(!walletConnected){
      web3ModalRef.current = new web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disabledInjectedProvider: false

      });
      connectWallet();
    }
    }, [walletConnected]);
    return (
      <div>
        <Head>
          <title>Whitelist Dapp</title>
          <meta name="description" content="Whitelist-Dapp" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
            <div className={styles.description}>
              Its an NFT collection for developers in Crypto.
            </div>
            <div className={styles.description}>
              {numberOfWhitelisted} have already joined the Whitelist
            </div>
            {renderButton()}
          </div>
          <div>
            <img className={styles.image} src="./crypto-devs.svg" />
          </div>
        </div>
  
        <footer className={styles.footer}>
          Made with &#10084; by Frank
        </footer>
      </div>
    );
}
