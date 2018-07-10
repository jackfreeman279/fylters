/**
 * Class the describes a simple node in a treew data structure. Each filter is modeled as a element in a tree and this
 * is how the dependencies are modeled and evaluated, dependencies are represented as a parent child relationship.
 * Here we provide helper methods for evalutaing these relationships.
 */
export class TreeNode {

    /**
     * initialise the tree node with no parent and no children
     */
    constructor() {
        this.parent = null;
        this.children = [];
    }

    /**
     * Is a given node a child of this node?
     *
     * @param  {TreeNode}  node the node to check
     * @return {Boolean} if the given node is a child of a parent
     */
    hasChild( node ) {

        return this.children.indexOf( node ) > -1;
    }

    /**
     * Check wether the given node is the parent of this node
     *
     * @param  {TreeNode}  node node to check
     * @return {Boolean} wether the given node is a preant of this node
     */
    parentIs( node ) {
        return this.getParent() === node;
    }

    /**
     * Add a TreeNode as a child of this node and set it as parent value
     *
     * @param {TreeNode} node the node to add as a child
     */
    addChild ( node ) {

        if ( this.hasChild( node ) ) {
            throw new Error( 'Attempted to add a child that already exists' );
            return;
        }

        if ( this.parentIs( node ) ) {
            throw new Error( 'Attempted to create a cyclic dependency, adding a child that is already the parent' );
            return;
        }

        this.children.push( node );
        node.setParent( this );
    }

    /**
     * Wether the node has any children at the moment
     *
     * @return {Boolean} wether the node has any children
     */
    hasChildren() {
        return this.children.length > 0;
    }

    /**
     * Add a given node as a parent of this node
     *
     * @param {TreeNode} node the parent to set
     */
    setParent ( node ) {

        if ( this.hasChild( node ) ) {
            throw new Error( 'Attempted to create a cyclic dependency, adding a parent that is already a child' );
            return;
        }

        if ( this.parentIs( node ) ) {
            throw new Error( 'Attempted to set a parent that is already the parent' );
            return;
        }

        this.parent = node;
    }

    /**
     * A root node is a node with no parents, i.e. this node is dependant on no others
     *
     * @return {Boolean} Wether the node is a child
     */
    isRoot () {
        return this.parent === null;
    }

    /**
     * Get all the children of this node
     *
     * @return {Array.<TreeNode>} the children
     */
    getChildren () {
        return this.children;
    }

    /**
     * Get the current parent if it exists
     *
     * @return {TreeNode} the parent or null
     */
    getParent() {
        return this.parent;
    }
}
