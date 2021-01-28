pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{
    string public name = "Dapp Token Farm";

    DappToken public dappToken;
    DaiToken public daiToken;

    address[] public stakers;
    address public owner;
    mapping(address => uint ) public stakingBalance;
    mapping(address => bool ) public hasStake;
    mapping(address => bool ) public isStake;

    constructor(DappToken _dappToken, DaiToken _daitoken) public{
        dappToken = _dappToken;
        daiToken = _daitoken;
        owner = msg.sender;
    }

    //stakes tokens deposit

    function stakeTokens(uint _amount) public {
        //Require amount greater than 0
        require(_amount > 0, "Amount cannot be 0");
        //Transfer Mock dai to this contract
        daiToken.transferFrom(msg.sender, address(this), _amount);

        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount ;

        if(!hasStake[msg.sender]){
            stakers.push(msg.sender);
        }
        isStake[msg.sender] = true;
        hasStake[msg.sender] = true;
    }

    //unstake tokens withdraw
    function unstakeTokens() public{
        uint balance  = stakingBalance[msg.sender];
        require(balance > 0, "Amount cannot be zero");

        daiToken.transfer(msg.sender, balance);

        stakingBalance[msg.sender] = 0;

        isStake[msg.sender] = false;

    }
    // Issuing Tokens

    function issueTokens() public {
        //owners only can call this functo=ion 
        require(msg.sender == owner, "caller must be owner" );
        // Issue tokens to all stakers
        for ( uint i = 0 ; i< stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0 ){
                dappToken.transfer(recipient, balance);
            }
        }
    }



}