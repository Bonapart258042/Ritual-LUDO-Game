// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LudoVictoryRegistrar {
    event LudoVictoryRegistered(address indexed player, string winnerName, uint32 moves, uint32 duration);

    struct VictoryRecord {
        address player;
        string winnerName;
        uint32 moves;
        uint32 duration;
        uint256 timestamp;
    }

    VictoryRecord[] public victories;

    function registerLudoVictory(string calldata winnerName, uint32 moves, uint32 duration) external {
        victories.push(VictoryRecord({
            player: msg.sender,
            winnerName: winnerName,
            moves: moves,
            duration: duration,
            timestamp: block.timestamp
        }));
        emit LudoVictoryRegistered(msg.sender, winnerName, moves, duration);
    }

    function getVictoriesCount() external view returns (uint256) {
        return victories.length;
    }
}
