App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: async () => {
        return await App.initWeb3();
    },

    initWeb3: async () => {
        if (window.ethereum)  {
            App.web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
            } catch (error) {
                console.error("User denied account access");
            }
        } else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
        }
        web3 = new Web3(App.web3Provider);

        return App.initContract();
    },

    initContract: () => {
        $.getJSON("Election.json", (data) => {
            let electionArtifact = data;
            App.contracts.Election = TruffleContract(electionArtifact);
            App.contracts.Election.setProvider(App.web3Provider);
            App.eventListener();
            return App.render();
        });
    },

    render: () => {
        var electionInstance;
        var loader = $("#loader");
        var content = $("#content");

        loader.show();
        content.hide();

        // Load account data
        web3.eth.getCoinbase((err, account) => {
            if (err === null) {
                App.account = account;
                $("#accountAddress").html("Your Account: " + account);
            }
        });

        // Load contract data
        App.contracts.Election.deployed().then((instance) => {
            electionInstance = instance;
            return electionInstance.candidatesCount();
        }).then((candidatesCount) => {
            let candidatesResults = $("#candidatesResults");
            candidatesResults.empty();

            let candidatesSelect = $("#candidatesSelect");
            candidatesSelect.empty();

            for (let i = 1; i <= candidatesCount; i++) {
                electionInstance.candidates(i).then((candidate) => {
                    let id = candidate[0];
                    let name = candidate[1];
                    let voteCount = candidate[2];

                    // Render candidate Result
                    let candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>";
                    candidatesResults.append(candidateTemplate);

                    // Render candidate ballot option
                    let candidateOption = "<option value='" + id + "'>" + name + "</option>";
                    candidatesSelect.append(candidateOption);
                });
            }
            return electionInstance.voters(App.account);
        }).then((hasVoted) => {
            if(hasVoted) {
               $("#form").hide();
            }
            loader.hide();
            content.show();
        }).catch((error) => {
            console.warn(error);
        });
    },

    castVote: () => {
        let candidateId = $("#candidatesSelect").val();
        App.contracts.Election.deployed().then((instance) => {
            return instance.vote(candidateId, { from: App.account });
        }).then((result) => {
            // Wait for votes to update
            $("#content").hide();
            $("#loader").show();
        }).catch((err) => {
            console.error(err);
        });
    },

    eventListener: () => {
        App.contracts.Election.deployed().then((instance) => {
            instance.votedEvent({}, {
                fromBlock: 0,
                toBlock: "latest"
            }).watch((error, event) => {
                console.log("Event triggered", event);
                App.render();
            });
        });
    }
};

$(() => {
    $(window).load(() => {
        App.init();
    });
});
