import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import Color from './contracts/Color.json';


import "./App.css";
import Web3 from "web3";


// Helper functions
function colorHexToString(hexString) {
  return '#' + hexString.substring(2);
}

function colorStringToBytes(str) {
  
  if (str.length !== 7 || str.charAt(0) !== '#') {
    throw new Error('invalid color string');
  }

  const hexString = '0x' + str.substring(1);
  return Web3.utils.hexToBytes(hexString);
}


class App extends Component {
  // state = { storageValue: 0, web3: null, accounts: null, contract: null };



  constructor(props) {
    super(props);

    this.state = {
      account: '',
      contract: null,
      totalSupply: 0,
      colors: [],
    };
  }

  async componentWillMount() {

    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {

    if (window.ethereum) {
      // Current web3 Providers
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();

    } else if (window.web3) {
      // Fallback for older web3 providers
      window.web3 = new Web3(window.web3.currentProvider);

    } else {
      // No web3 provider, user needs to install one in their browser
      window.alert('No injected web3 provider detected');
    }

    console.log(window.web3.currentProvider);
  }


  async loadBlockchainData() {

    const web3 = window.web3;

    // Load our account
    const accounts = await web3.eth.getAccounts();
    console.log('account: ', accounts[0]);

    // Update state
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();
    const networkData = Color.networks[networkId];


    if (!networkData) {
      window.alert('Smart contract not deployed to detected network!');
      return;
    }


    const abi = Color.abi;
    const address = networkData.address;
    const contract = new web3.eth.Contract(abi, address);
    // Update state with color contract
    this.setState({ contract });

    const totalSupply = await contract.methods.totalSupply().call();
    // Update state with totalsupply amount
    this.setState({ totalSupply });


    // Load colors
    for (var i = 1; i <= totalSupply; i++) {
      const colorBytes = await contract.methods.colors(i - 1).call();

      const colorStr = colorHexToString(colorBytes);
      // Update state array
      this.setState({
        colors: [...this.state.colors, colorStr],
      });
    }

  }

  // Function mints with input of color String
  mint = (colorStr) => {

    const colorBytes = colorStringToBytes(colorStr);

    this.state.contract.methods
      .mint(colorBytes)
      .send({ from: this.state.account })
      .once('receipt', (receipt) => {
        console.log('transaction receipt: ', receipt)

        this.setState({
          colors: [...this.state.colors, colorStr],
        });
      });

  }

  // componentDidMount = async () => {
  //   try {
  //     // Get network provider and web3 instance.
  //     const web3 = await getWeb3();

  //     // Use web3 to get the user's accounts.
  //     const accounts = await web3.eth.getAccounts();

  //     // Get the contract instance.
  //     const networkId = await web3.eth.net.getId();
  //     const deployedNetwork = SimpleStorageContract.networks[networkId];
  //     const instance = new web3.eth.Contract(
  //       SimpleStorageContract.abi,
  //       deployedNetwork && deployedNetwork.address,
  //     );

  //     // Set web3, accounts, and contract to the state, and then proceed with an
  //     // example of interacting with the contract's methods.
  //     this.setState({ web3, accounts, contract: instance }, this.runExample);
  //   } catch (error) {
  //     // Catch any errors for any of the above operations.
  //     alert(
  //       `Failed to load web3, accounts, or contract. Check console for details.`,
  //     );
  //     console.error(error);
  //   }
  // };

  // runExample = async () => {
  //   const { accounts, contract } = this.state;

  //   // Stores a given value, 5 by default.
  //   await contract.methods.set(5).send({ from: accounts[0] });

  //   // Get the value from the contract to prove it worked.
  //   const response = await contract.methods.get().call();

  //   // Update state with the result.
  //   this.setState({ storageValue: response });
  // };


  // Render function
  render() {
    // if (!this.state.web3) {
    //   return <div>Loading Web3, accounts, and contract...</div>;
    // }
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0shadow">
          
          <span className="navbar-brand col-sm3 col-md-2 mr-0">
            Color Tokens
          </span>

          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">

              <small className="text-white">
                <span id="account">{this.state.account}</span>
              </small>

            </li>
          </ul>
        </nav>

        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue Token</h1>

                <form onSubmit={(event) => {
                  event.preventDefault();
                  const colorStr = this.color.value;

                  this.mint(colorStr);
                }}>
                  
                  <input type='text' className='form-control mb-1' placeholder='e.g #FF00FF' ref={(input) => { this.color = input }} />

                  <input type='submit' className='btn btn-block btn-primary' value='MINT' />

                  

                </form>

              </div>
            </main>
          </div>

          <hr/>
          <div className="row text-center">
            { this.state.colors.map((colorStr, key) => {
              return (
                <div key={key} className="col-md-3 mb-3">

                  <div className="token" style={ { backgroundColor: colorStr }}></div>
                  
                  <div>{colorStr}</div>
                </div>
              );
            })}
          </div>
        </div>


      </div>
    );
  }
}

export default App;
