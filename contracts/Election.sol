pragma solidity ^0.5.0;

contract Election {
    string public candidate;
    uint public candidatesCount;

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    event votedEvent (
        uint indexed _candidateId
    );

    constructor () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote(uint _candidateId) public {
        // Require that voter hasn't already voted
        require(!voters[msg.sender]);

        // Require that candidateId is valid
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // Record voter as voted
        voters[msg.sender] = true;

        // Update candidate vote count
        candidates[_candidateId].voteCount ++;

        emit votedEvent(_candidateId);
    }
}
