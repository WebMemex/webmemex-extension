/* Generic tree walking algorithms
 * In our context, a tree is defined by two things:
 * 1. An object containing a pair of functions that let us walk from a given node to its neighbours:
 *   walkFunctions = {
 *     getParent :: node → node,
 *     getChildren :: node → [node],
 *   }
 *   Either or both functions may be asynchronous.
 * 2. A single node, to start walking from.
 */

// Given a node, return all nodes connected to it.
// Example usage: const nodes = getAllNodes(walkFunctions)(node)
export const getAllNodes = ({getParent, getChildren}) => async node => {
    // First find the root, then crawl down each branch.
    let root = await getRoot({getParent})(node)
    const crawled = []
    const toCrawl = [root]
    let next
    while ((next = toCrawl.pop()) !== undefined) {
        if (crawled.includes(next) || toCrawl.includes(next)) {
            continue
        }
        const children = await getChildren(next)
        toCrawl.push(...children)
        crawled.push(next)
    }
    return crawled
}

// Get the root (uppermost parent) of the tree of the given node.
// Example usage: const root = await getRoot(walkFunctions)(node)
export const getRoot = ({getParent}) => async node => {
    let root = node
    let next
    while ((next = await getParent(root)) !== undefined) {
        root = next
    }
    return root
}
