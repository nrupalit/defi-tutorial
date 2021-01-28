const { assert } = require('chai')
// const { Item } = require('react-bootstrap/lib/Breadcrumb')

const DaiToken = artifacts.require("DaiToken")
const DappToken = artifacts.require("DappToken")
const TokenFarm = artifacts.require("TokenFarm")

require('chai')
    .use(require('chai-as-promised'))
    .should()

// helper function 
function tokens(n){
    return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner , investor]) => {
    let daiToken , dapptoken , tokenFarm
    before(async () => {
        daiToken = await DaiToken.new()
        dapptoken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dapptoken.address , daiToken.address)
        // Transfer token to Dapp to fram
        await dapptoken.transfer(tokenFarm.address , tokens('1000000'))
        // Send tokens to investor
        await daiToken.transfer(investor , tokens('100') , { from: owner })
    })

    // Tests here
    describe('Mock DAI deployment', async ()=> {
        it('has a name', async () => {
            // let daiToken = await DaiToken.new()
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        }) 
    })

    describe('Dapp TOken deployment', async () => {
        it('has a name', async () => {
            const name = await dapptoken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('TokenFarm deployment', async ()=> {
        it('has a name', async () => {
            // let daiToken = await DaiToken.new()
            const namess = await tokenFarm.name()
            assert.equal(namess, 'Dapp Token Farm')
        }) 
        it('contract has tokens' , async () => {
            let balance = await dapptoken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming tokens', async () => {

        it('rewards investors for staking mDai tokens', async () => {
          let result
    
          // Check investor balance before staking
          result = await daiToken.balanceOf(investor)
          assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')
    
          // Stake Mock DAI Tokens
          await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
          await tokenFarm.stakeTokens(tokens('100'), { from: investor })
    
          // Check staking result
          result = await daiToken.balanceOf(investor)
          assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')
    
          result = await daiToken.balanceOf(tokenFarm.address)
          assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')
    
          result = await tokenFarm.stakingBalance(investor)
          assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')
    
          result = await tokenFarm.isStake(investor)
          assert.equal(result.toString(), 'true', 'investor staking status correct after staking')
    
          // Issue Tokens
          await tokenFarm.issueTokens({ from: owner })
    
          // Check balances after issuance
          result = await dapptoken.balanceOf(investor)
          assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct affter issuance')
    
          // Ensure that only onwer can issue tokens
          await tokenFarm.issueTokens({ from: investor }).should.be.rejected;
    
          // Unstake tokens
          await tokenFarm.unstakeTokens({ from: investor })
    
          // Check results after unstaking
          result = await daiToken.balanceOf(investor)
          assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')
    
          result = await daiToken.balanceOf(tokenFarm.address)
          assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after staking')
    
          result = await tokenFarm.stakingBalance(investor)
          assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')
    
          result = await tokenFarm.isStake(investor)
          assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
        })
      })
})