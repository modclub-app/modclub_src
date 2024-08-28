import yaml

def get_unique_controllers(file_path):
    with open(file_path, 'r') as file:
        data = yaml.safe_load(file)

    controllers = set()
    airdrop_neurons = data['initial_token_distribution']['FractionalDeveloperVotingPower']['airdrop_distribution']['airdrop_neurons']

    for neuron in airdrop_neurons:
        controller = neuron['controller']
        controllers.add(controller)

    return list(controllers)

# Example usage
file_path = 'sns.yml'
unique_controllers = get_unique_controllers(file_path)
print(unique_controllers)