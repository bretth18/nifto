pragma solidity 0.5.16;

import '@openzeppelin/contracts/token/ERC721/ERC721Full.sol';

contract Color is ERC721Full {

    bytes3[] public colors;
    mapping(bytes3 => bool) private _colorExists;

    // Adding name and symbol at constructor
    constructor() ERC721Full("Color", "COLOR") public {

    }

    // color = "#hex"
    function mint(bytes3 _color) public {
        require(!_colorExists[_color], "color exists");
        uint _id = colors.push(_color);
        _mint(msg.sender, _id);
        _colorExists[_color] = true;
    }
    
}