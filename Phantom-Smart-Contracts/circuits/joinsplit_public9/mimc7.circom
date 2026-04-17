pragma circom 2.0.0;

include "mimc7_constants.circom";

// x^7 over BN128 scalar field (matches Solidity MiMC7.pow7)
template Pow7() {
    signal input in;
    signal output out;
    signal x2;
    signal x4;
    signal x6;
    x2 <== in * in;
    x4 <== x2 * x2;
    x6 <== x4 * x2;
    out <== x6 * in;
}

// Circom-style MiMC7 compression (matches MiMC7.sol + noteModel.js)
template MiMC7() {
    signal input x;
    signal input k;
    signal output h;

    signal t0;
    t0 <== x + k;
    component p0 = Pow7();
    p0.in <== t0;

    signal t[92];
    t[1] <== p0.out;

    component pows[90];
    for (var i = 1; i <= 90; i++) {
        pows[i - 1] = Pow7();
        pows[i - 1].in <== t[i] + k + MIMC7_C(i);
        t[i + 1] <== pows[i - 1].out;
    }

    h <== t[91] + k;
}
