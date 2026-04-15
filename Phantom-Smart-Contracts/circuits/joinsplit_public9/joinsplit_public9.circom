pragma circom 2.0.0;

/**
 * MVP join-split **public signal layout** for Phantom `ShieldedPool._joinSplitPublicInputsToArray`.
 * Private inputs are unconstrained copies; real production circuits must bind these to
 * Merkle membership, nullifier derivation, and conservation.
 *
 * Public output order (must match on-chain indices 0..8):
 *   0 nullifier
 *   1 inputCommitment
 *   2 outputCommitmentSwap
 *   3 outputCommitmentChange
 *   4 merkleRoot
 *   5 outputAmountSwap
 *   6 minOutputAmountSwap
 *   7 protocolFee
 *   8 gasRefund
 */
template JoinSplitPublic9() {
    signal output nullifier;
    signal output inputCommitment;
    signal output outputCommitmentSwap;
    signal output outputCommitmentChange;
    signal output merkleRoot;
    signal output outputAmountSwap;
    signal output minOutputAmountSwap;
    signal output protocolFee;
    signal output gasRefund;

    signal input in_nullifier;
    signal input in_inputCommitment;
    signal input in_outputCommitmentSwap;
    signal input in_outputCommitmentChange;
    signal input in_merkleRoot;
    signal input in_outputAmountSwap;
    signal input in_minOutputAmountSwap;
    signal input in_protocolFee;
    signal input in_gasRefund;

    nullifier <== in_nullifier;
    inputCommitment <== in_inputCommitment;
    outputCommitmentSwap <== in_outputCommitmentSwap;
    outputCommitmentChange <== in_outputCommitmentChange;
    merkleRoot <== in_merkleRoot;
    outputAmountSwap <== in_outputAmountSwap;
    minOutputAmountSwap <== in_minOutputAmountSwap;
    protocolFee <== in_protocolFee;
    gasRefund <== in_gasRefund;
}

component main = JoinSplitPublic9();
