// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GroupManager {

    struct Card {
        string cardNo;
        string cvv;
        string expireDate;
    }

    struct Group {
        address creator;
        address[] members;
        string name;
        bool active;
        Card card;
    }

    mapping(uint256 => Group) groups; // public kaldırıldı, gizlilik için
    uint256 public groupCount;
    address public roflAddress = 0x5e3aCEe942a432e114F01DCcCD06c904a859eDB1; // ROFL'in statik adresi

    event GroupCreated(uint256 groupId, address creator, address[] members);

    // Grup oluşturma fonksiyonu
    function createGroup(address[] memory _members, string memory _name) public {
        groupCount++;
        groups[groupCount] = Group({
            creator: msg.sender,
            members: _members,
            name: _name,
            active: true,
            card: Card("", "", "") // Varsayılan boş kart
        });
        emit GroupCreated(groupCount, msg.sender, _members);
    }

    // Kart bilgilerini güncelleme (sadece ROFL tarafından)
    function updateCardInfo(uint256 _groupId, Card memory _card) public {
        require(groups[_groupId].active, "Group is not active");
        require(msg.sender == roflAddress, "Only ROFL can update card information");
        groups[_groupId].card = _card;
    }

    function getMyGroups(address _caller) public view returns (Group[] memory) {
        // First, count how many groups the caller is part of to size the array
        uint256 count = 0;
        for (uint256 i = 1; i <= groupCount; i++) {
            if (groups[i].active && (groups[i].creator == _caller || isMember(i, _caller))) {
                count++;
            }
        }

        // Create an array to store the groups
        Group[] memory myGroups = new Group[](count);
        uint256 index = 0;

        // Populate the array with matching groups
        for (uint256 i = 1; i <= groupCount; i++) {
            if (groups[i].active && (groups[i].creator == _caller || isMember(i, _caller))) {
                myGroups[index] = groups[i];
                index++;
            }
        }

        return myGroups;
    }

    // Helper function to check if an address is a member of a group
    function isMember(uint256 _groupId, address _caller) private view returns (bool) {
        for (uint256 j = 0; j < groups[_groupId].members.length; j++) {
            if (groups[_groupId].members[j] == _caller) {
                return true;
            }
        }
        return false;
    }
}