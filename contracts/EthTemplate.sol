`
// SPDX-License-Identifier: MIT

 ________                                ______                   __            __    __  ________  ________ 
|        \                              /      \                 |  \          |  \  |  \|        \|        \
 \$$$$$$$$ ______    ______    ______  |  $$$$$$\  ______    ____| $$  ______  | $$\ | $$| $$$$$$$$ \$$$$$$$$
    /  $$ /      \  /      \  /      \ | $$   \$$ /      \  /      $$ /      \ | $$$\| $$| $$__       | $$   
   /  $$ |  $$$$$$\|  $$$$$$\|  $$$$$$\| $$      |  $$$$$$\|  $$$$$$$|  $$$$$$\| $$$$\ $$| $$  \      | $$   
  /  $$  | $$    $$| $$   \$$| $$  | $$| $$   __ | $$  | $$| $$  | $$| $$    $$| $$\$$ $$| $$$$$      | $$   
 /  $$___| $$$$$$$$| $$      | $$__/ $$| $$__/  \| $$__/ $$| $$__| $$| $$$$$$$$| $$ \$$$$| $$         | $$   
|  $$    \\$$     \| $$       \$$    $$ \$$    $$ \$$    $$ \$$    $$ \$$     \| $$  \$$$| $$         | $$   
 \$$$$$$$$ \$$$$$$$ \$$        \$$$$$$   \$$$$$$   \$$$$$$   \$$$$$$$  \$$$$$$$ \$$   \$$ \$$          \$$  
 

// Drop Your NFT Collection With ZERO Coding Skills at https://zerocodenft.com
*/

pragma solidity ^0.8.1;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
${whitelist_imports_declaration}
${royalties_imports_declaration}

contract ${name} is ERC721, Ownable ${whitelist_EIP712} {
    using Counters for Counters.Counter;
    using Strings for uint128;
    using Strings for uint;
    using SafeMath for uint;

    Counters.Counter private _tokenIds;

    ${collection_size}
    ${mint_price}
    ${max_tokens_per_transaction}
    ${whitelist_whitelistPrice}

    bool public isPublicSaleActive = false;
    ${whitelist_isWhiteListSaleActive}
    ${delayedReveal_canReveal}
    
    ${base_url}
    ${delayedReveal_hiddenURI}

    ${whitelist_voucherSigner}

    constructor()
        Ownable()
        ${ERC721_constructor}
        ${whitelist_constructor_EIP712} {
            ${reserve_function_call_from_constructor}
        }

    ${whitelist_NFTVoucher_struct_declaration}

    ${reserve_function_declaration}

    function totalSupply() external view returns (uint) {
        return _tokenIds.current();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override (ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Set base URI
    function setBaseUri(string memory uri) onlyOwner external {
        _baseURL = uri;
    }

    /// @notice Flip public sale
    function flipSaleState() onlyOwner external {
        isPublicSaleActive = !isPublicSaleActive;
    }

    ${whitelist_flipPresaleState_function_declaration}

    ${delayedReveal_reveal_function_declaration}

    /// @notice Withdraw contract's balance to the owner's wallet
    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "No balance");

        payable(owner()).transfer(address(this).balance);
    }

    /// @notice Get token's URI. In case of delayed reveal we give user the json of the placeholer metadata.
    /// @param tokenId token ID
    function tokenURI(uint tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory baseURI = _baseURI();
        ${delayedReveal_tokenURI_canreveal_condition}
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }

    ${whitelist_mint_function_declaration}

    ${basic_mint_function_declaration}

    /// @dev override base uri. It will be combined with token ID
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURL;
    }

    ${whitelist_hash_verify_function_declarations}
}
`