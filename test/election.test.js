const Election = artifacts.require("Election");

contract("Election", (accounts) => {
    let electionInstance;
    let candidate1;
    let candidate2;

    before(async () => {
        electionInstance = await Election.deployed();
    });

    describe("Proper initialization", async () => {
        it("Initializes with two candidates", async () => {
            let candidatesCount = await electionInstance.candidatesCount();
            assert.equal(candidatesCount, 2, "Initialized with two candidates");
        });

        it("Initializes the candidates with the correct values", async () => {
            candidate1 = await electionInstance.candidates(1);
            candidate2 = await electionInstance.candidates(2);
            assert.equal(candidate1[0], 1, "Candidate 1 initialized with correct id");
            assert.equal(candidate1[1], "Candidate 1", "Candidate 1 initialized with correct name");
            assert.equal(candidate1[2], 0, "Candidate 1 initialized with correct vote count");
            assert.equal(candidate2[0], 2, "Candidate 2 initialized with correct id");
            assert.equal(candidate2[1], "Candidate 2", "Candidate 2 initialized with correct name");
            assert.equal(candidate2[2], 0, "Candidate 2 initialized with correct vote count");
        });
    });

    describe("Casting votes", async () => {
        it("Account[0] vote increments candidate 1 vote count", async () => {
            let receipt = await electionInstance.vote(1, { from: accounts[0] });

            // Check that a vote event was emitted
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
            assert.equal(receipt.logs[0].args._candidateId.toNumber(), 1, "the candidate id is correct");

            candidate1 = await electionInstance.candidates(1);
            candidate2 = await electionInstance.candidates(2);
            // Candidate 1 vote count changed.
            assert.equal(candidate1[2], 1, "Candidate 1 vote count incremented");
            // Candidate 2 vote count unchanged.
            assert.equal(candidate2[2], 0, "Candidate 2 vote count not incremented");
        });

        it("Account[0] unable to vote again", async () => {
            try {
                await electionInstance.vote(1, { from: accounts[0] });
            } catch (error) {
                assert(error.message.indexOf("revert") >= 0, "Error message must contain revert");
                candidate1 = await electionInstance.candidates(1);
                assert.equal(candidate1[2], 1, "Candidate 1 vote count not incremented");
            }
        });

        it("Throws exception for invalid candidate 0", async () => {
            try {
                await electionInstance.vote(0, { from: accounts[1] });
            } catch (error) {
                assert(error.message.indexOf("revert") >= 0, "Error message must contain revert");
            }
        });

        it("Throws exception for invalid candidate 3", async () => {
            try {
                await electionInstance.vote(3, { from: accounts[1] });
            } catch (error) {
                assert(error.message.indexOf("revert") >= 0, "Error message must contain revert");
            }
        });

        it("Account[1] vote increments candidate 1 vote count", async () => {
            await electionInstance.vote(1, { from: accounts[1] });
            candidate1 = await electionInstance.candidates(1);
            candidate2 = await electionInstance.candidates(2);
            // Candidate 1 vote count changed.
            assert.equal(candidate1[2], 2, "Candidate 1 vote count incremented");
            // Candidate 2 vote count unchanged.
            assert.equal(candidate2[2], 0, "Candidate 2 vote count not incremented");
        });

        it("Account[1] unable to vote again", async () => {
            try {
                await electionInstance.vote(1, { from: accounts[1] });
            } catch (error) {
                assert(error.message.indexOf("revert") >= 0, "Error message must contain revert");
                candidate1 = await electionInstance.candidates(1);
                assert.equal(candidate1[2], 2, "Candidate 1 vote count not incremented");
            }
        });
    });
});
