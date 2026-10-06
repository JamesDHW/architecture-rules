/** The only statement of a branch: the branch itself, or the sole statement of its block. */
export const getSoleStatement = (branch) => {
    if (branch.type !== "BlockStatement")
        return branch;
    return branch.body.length === 1 ? branch.body[0] : undefined;
};
//# sourceMappingURL=branchStatement.js.map