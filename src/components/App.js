import React, { Component } from 'react'
import Navbar from './Navbar'
import './App.css'
import Web3 from 'web3'
import Daitoken from '../abis/DaiToken.json'
import Dapptoken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Main from './Main'
// import Spinner  from "react-bootstrap/Spinner";



class App extends Component {

  async componentDidMount(){
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  async loadBlockchainData(){
    const web3 = window.web3
    const accounts =  await web3.eth.getAccounts()
    this.setState({ account: accounts[0]})

    const networkId = await web3.eth.net.getId()
    
    const daiTokenData = Daitoken.networks[networkId]
    if(daiTokenData){
      const daiToken = new web3.eth.Contract(Daitoken.abi, daiTokenData.address)
      this.setState({ daiToken })
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
    }
    else {
      window.alert('DaiToken contract not deployed to detected network')
    }

    const dappTokenData = Dapptoken.networks[networkId]
    if(dappTokenData){
      const dappToken = new web3.eth.Contract(Dapptoken.abi, dappTokenData.address)
      this.setState({ dappToken })
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString() })
      // console.log(dappTokenBalance);
    }
    else {
      window.alert('DappToken contract not deployed to detected network')
    }

    // Load TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId]
    if(tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('TokenFarm contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3(){
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying Metamask!')
    }
  }

  stakeTokens = (amount) =>{
    this.setState({ loading: true})
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeTokens = () => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false})
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content 
    if (this.state.loading){
      content = <div class="spinner-border m-5" role="status"><span class="sr-only">Loading...</span></div>
    } else {
      content = <Main
        daiTokenBalance= {this.state.daiTokenBalance}
        dappTokenBalance= {this.state.dappTokenBalance}
        stakingBalance= {this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
