var ifUseYinshe = '1';
var a = 'S000000412316799';
var b = new Array([190]);
b[0] = 'Z';
b[1] = ' ';
b[2] = 'H';
b[3] = 'M';
b[4] = '>';
b[5] = 'N';
b[6] = '[';
b[7] = 'B';
b[8] = 'S';
b[9] = 'V';
b[10] = ',';
b[11] = 'C';
b[12] = 'p';
b[13] = 'X';
b[14] = '\'';
b[15] = 'Z';
b[16] = 'k';
b[17] = 'L';
b[18] = 'C';
b[19] = 'K';
b[20] = 'u';
b[21] = 'J';
b[22] = ':';
b[23] = 'H';
b[24] = '-';
b[25] = 'G';
b[26] = '{';
b[27] = 'F';
b[28] = '9';
b[29] = 'D';
b[30] = 'K';
b[31] = 'S';
b[32] = 'U';
b[33] = 'A';
b[34] = '8';
b[35] = 'P';
b[36] = ')';
b[37] = 'O';
b[38] = 'V';
b[39] = 'I';
b[40] = 'l';
b[41] = 'U';
b[42] = 'P';
b[43] = 'Y';
b[44] = '&';
b[45] = 'T';
b[46] = 'z';
b[47] = 'R';
b[48] = 'G';
b[49] = 'E';
b[50] = 'e';
b[51] = 'W';
b[52] = 'Y';
b[53] = 'Q';
b[54] = '*';
b[55] = '/';
b[56] = 'i';
b[57] = '.';
b[58] = 'Q';
b[59] = ',';
b[60] = '7';
b[61] = '?';
b[62] = '.';
b[63] = '>';
b[64] = '_';
b[65] = '<';
b[66] = 'R';
b[67] = 'm';
b[68] = '^';
b[69] = 'n';
b[70] = 'J';
b[71] = 'b';
b[72] = '1';
b[73] = 'v';
b[74] = 's';
b[75] = 'c';
b[76] = '5';
b[77] = 'x';
b[78] = '~';
b[79] = 'z';
b[80] = 'd';
b[81] = '\'';
b[82] = 'b';
b[83] = ';';
b[84] = '/';
b[85] = '"';
b[86] = 'j';
b[87] = ':';
b[88] = ']';
b[89] = 'l';
b[90] = 'M';
b[91] = 'k';
b[92] = 'F';
b[93] = 'j';
b[94] = '<';
b[95] = 'h';
b[96] = 'a';
b[97] = 'g';
b[98] = 'W';
b[99] = 'f';
b[100] = 'B';
b[101] = 'd';
b[102] = 'w';
b[103] = 's';
b[104] = '(';
b[105] = 'a';
b[106] = '@';
b[107] = ']';
b[108] = 'q';
b[109] = '[';
b[110] = 'T';
b[111] = '}';
b[112] = '3';
b[113] = '{';
b[114] = ' ';
b[115] = 'p';
b[116] = 'I';
b[117] = 'o';
b[118] = '$';
b[119] = 'i';
b[120] = 'm';
b[121] = 'u';
b[122] = 'A';
b[123] = 'y';
b[124] = 'r';
b[125] = 't';
b[126] = 'y';
b[127] = 'r';
b[128] = '!';
b[129] = 'e';
b[130] = '#';
b[131] = 'w';
b[132] = 'E';
b[133] = 'q';
b[134] = 'N';
b[135] = '\\';
b[136] = 'c';
b[137] = '=';
b[138] = 't';
b[139] = '-';
b[140] = '=';
b[141] = '0';
b[142] = 'g';
b[143] = '9';
b[144] = 'O';
b[145] = '8';
b[146] = '`';
b[147] = '7';
b[148] = 'X';
b[149] = '6';
b[150] = '+';
b[151] = '5';
b[152] = ';';
b[153] = '4';
b[154] = 'h';
b[155] = '3';
b[156] = '4';
b[157] = '2';
b[158] = 'v';
b[159] = '1';
b[160] = 'o';
b[161] = '`';
b[162] = 'L';
b[163] = '|';
b[164] = 'f';
b[165] = '+';
b[166] = '}';
b[167] = '_';
b[168] = 'n';
b[169] = ')';
b[170] = '2';
b[171] = '(';
b[172] = 'D';
b[173] = '*';
b[174] = '?';
b[175] = '&';
b[176] = '"';
b[177] = '^';
b[178] = '0';
b[179] = '%';
b[180] = '6';
b[181] = '$';
b[182] = 'x';
b[183] = '#';
b[184] = '%';
b[185] = '@';
b[186] = '|';
b[187] = '!';
b[188] = '\\';
b[189] = '~';
var jiami = 0;
var keyjiami = 0;
var keyjiamiName = "0";

console.log(a); 

function jiamiEveryMimas(jimaPassValue) {
    var newValue = jimaPassValue;
    var specialChar = 0;
    if (ifUseYinshe == 1) {
        var everyone = '';
        var afterPass = '';
        for (var i = 0; i < newValue.length; i++) {
            if (specialChar == 1) {
                break;
            }
            everyone = newValue.charAt(i);
            for (var j = 0; j < ((b.length) / 2); j++) {
                if (everyone == b[2 * j]) {
                    afterPass = afterPass + b[2 * j + 1];
                    break;
                }
                if (j == (b.length) / 2 - 1) {
                    if (everyone != b[2 * j]) {
                        specialChar = 1;
                        break;
                    }
                }
            }
        }
        if (specialChar == 0) {
            jimaPassValue = afterPass;
        } else {
            var ret = "";
            afterPass = '';
            for (i = 0; i < newValue.length; i++) {
                var c = newValue.substr(i, 1);
                var ts = escape(c);
                if (ts.substring(0, 2) == "%u") {
                    ret = ret + ts.replace("%u", "(^?)");
                } else {
                    ret = ret + c;
                }
            }
            jimaPassValue = ret;
            for (var n = 0; n < ret.length; n++) {
                everyone = ret.charAt(n);
                for (var w = 0; w < ((b.length) / 2); w++) {
                    if (everyone == b[2 * w]) {
                        afterPass = afterPass + b[2 * w + 1];
                        break;
                    }
                }
            }
            jimaPassValue = afterPass;
        }
        keyjiami = 1;
    }
	return jimaPassValue;
}

jiamiEveryMimas('zouchen123');


