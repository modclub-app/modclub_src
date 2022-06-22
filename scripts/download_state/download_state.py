from ic.client import Client
from ic.identity import Identity
from ic.agent import Agent
from ic.candid import encode, decode, Types
import csv
import os
import shutil
import time
from pathlib import Path

private_key = input("Please enter private key: ")
canister_id = input("Please enter canister id to download data from: ")
dirpath_this_file = os.path.dirname(__file__)
download_folder = dirpath_this_file + '/downloads/'
download_archive_folder = dirpath_this_file + '/downloads_archive/'


# create download folder if not exists

Path(download_archive_folder).mkdir(parents=True, exist_ok=True)
if os.path.isdir(download_folder):
    shutil.move(download_folder, download_archive_folder + "downloads_" + time.strftime("%b %d, %Y %H-%M-%S"))

Path(download_folder).mkdir(parents=True, exist_ok=True)

def create_param(state_name, var_name, start, end):
    params = [{'type': Types.Text, 'value': state_name},
              {'type': Types.Text, 'value': var_name},
              {'type': Types.Nat, 'value': start},
              {'type': Types.Nat, 'value': end}]
    return encode(params)


def write_in_csv(file_path, rows, header):
    with open(file_path, 'a+', encoding='UTF8') as f:
        writer = csv.writer(f)
        if header is not None:
            writer.writerow(header)
        for row in rows:
            writer.writerow(row)
agent = Agent(Identity(privkey=private_key), Client())
# more variables to be added
state_to_varName = {'pohState': ['pohChallenges', 'pohUserChallengeAttempts', 'token2ProviderAndUserData',
                                 'providerUserIdToModclubUserIdByProviderId', 'pohChallengePackages',
                                 'userToPohChallengePackageId', 'wordList', 'callbackIssuedByProvider'],

                    'contentQueueState': ['newContentQueues', 'allNewContentQueue', 'approvedContentQueue',
                                 'rejectedContentQueue', 'queueIds',
                                 'userId2QueueId', 'userId2QueueId'],
                    
                    # 'pohContentQueueState': ['newContentQueues', 'allNewContentQueue', 'approvedContentQueue',
                    #              'rejectedContentQueue', 'queueIds',
                    #              'userId2QueueId', 'userId2QueueId'],

                    'pohVoteState' : ['pohVotes', 'pohContent2votes', 'mods2Pohvotes', 'autoApprovePOHUserIds'],
                    'storageState' : ['dataCanisters', 'contentIdToCanisterId', 'moderatorsId']
                                 }
for (state_name, var_names) in state_to_varName.items():
    for var_name in var_names:
        print("Download state: " + state_name, " var_name: "+ var_name)
        # 0 and 100 will be provided dynamically with pagination
        params = create_param(state_name, var_name, 0, 100)
        response = agent.query_raw(canister_id, "downloadSupport", params)
        file_path = download_folder + state_name + "_" + var_name + ".csv"
        write_in_csv(file_path, response[0].get('value'), None)
        write_in_csv(file_path, response[0].get('value'), None)







