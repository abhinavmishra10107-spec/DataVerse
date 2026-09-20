const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

let A = [], L = [], DL = [], S = [], Q = [], T = null;
let G = { nodes: [], edges: [] };
let H = Array.from({ length: 10 }, () => []);

const C = (time, space, note) => ({ time, space, note });
const validNum = x => Number.isFinite(Number(x));
const response = (res, operation, payload = {}) => res.json({ operation, ...payload });

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'DataVerse API', modules: 'array,linked-list,doubly-linked-list,stack,queue,tree,graph,hashing,searching,sorting' }));

// ---------------- ARRAY ----------------
app.post('/api/array/create', (req, res) => {
  const values = Array.isArray(req.body.values) ? req.body.values.map(Number) : [];
  if (!values.length) return res.status(400).json({ error: 'Enter at least one array element.' });
  if (values.some(Number.isNaN)) return res.status(400).json({ error: 'Array values must be numeric.' });
  A = values;
  const steps = [
    `The user entered ${A.length} as the number of elements.`,
    `Create an empty array that will store ${A.length} values.`,
    `Start the input loop: for (int i = 0; i < ${A.length}; i++).`,
    `Initialize i = 0. The loop will run once for every index from 0 to ${A.length - 1}.`
  ];
  A.forEach((v, i) => {
    steps.push(`Loop iteration ${i + 1}: i = ${i}. Ask the user to enter the value for index ${i}.`);
    steps.push(`The user enters ${v}, so store ${v} at array index ${i}.`);
    if (i < A.length - 1) steps.push(`Increment i to ${i + 1} and continue the loop.`);
    else steps.push(`Increment i to ${A.length}. The condition i < ${A.length} is now false, so the loop terminates.`);
  });
  steps.push(`The final array contains ${A.length} elements: [${A.join(', ')}].`);
  steps.push(`Each element occupies one indexed position, starting at index 0.`);
  response(res, 'Create Array', { array: A, steps, complexity: C('O(n)', 'O(n)', 'n input values are stored.'), message: `${A.length} elements created.` });
});

app.post('/api/array/insert', (req, res) => {
  const p = Number(req.body.position), v = Number(req.body.value);
  if (!Number.isInteger(p) || p < 0 || p > A.length) return res.status(400).json({ error: 'Invalid insertion index.' });
  const before = A.slice();
  const steps = [
    `Check that index ${p} is valid. A valid insertion index is from 0 through ${before.length}.`,
    `The value ${v} must be inserted at index ${p}.`,
    `Increase the logical array size by one so that an empty position can be created.`
  ];
  A.push(null);
  for (let i = A.length - 1; i > p; i--) {
    steps.push(`Start from the right side. Copy the value ${A[i - 1]} from index ${i - 1} to index ${i}.`);
    A[i] = A[i - 1];
    steps.push(`Index ${i - 1} is now free, so continue shifting toward the target index.`);
  }
  A[p] = v;
  steps.push(`Store ${v} at the newly opened index ${p}.`);
  steps.push(`Verify the result: [${A.join(', ')}].`);
  steps.push(`Insertion is complete. ${A.length - p - 1} existing elements were shifted to the right.`);
  response(res, 'Insertion', { array: A, steps, complexity: C(p === before.length ? 'O(1) amortized' : 'O(n)', 'O(1) auxiliary', 'Elements after the insertion point may be shifted.'), message: `Inserted ${v} at index ${p}.`, highlight: [p], meta: { position: p, value: v, before } });
});

app.post('/api/array/delete', (req, res) => {
  const p = Number(req.body.position);
  if (!Number.isInteger(p) || p < 0 || p >= A.length) return res.status(400).json({ error: 'Invalid deletion index.' });
  const before = A.slice(), x = A[p];
  const steps = [
    `Check that index ${p} exists in the current array.`,
    `Read the element ${x} stored at index ${p}. This is the element selected for deletion.`,
    `After deleting it, the gap must be filled by shifting every later element one position to the left.`
  ];
  for (let i = p; i < A.length - 1; i++) {
    steps.push(`Copy ${A[i + 1]} from index ${i + 1} to index ${i}.`);
    A[i] = A[i + 1];
    steps.push(`The empty position has moved to index ${i + 1}. Continue until the old last element is reached.`);
  }
  A.pop();
  steps.push(`Remove the extra last slot from the array.`);
  steps.push(`The final array is [${A.join(', ')}].`);
  response(res, 'Deletion', { array: A, steps, complexity: C('O(n)', 'O(1) auxiliary', 'Elements after the deleted position may shift left.'), message: `Deleted ${x} from index ${p}.`, highlight: [], meta: { position: p, value: x, before } });
});

app.post('/api/array/search', (req, res) => linearSearch(A, Number(req.body.value), res, 'Linear Search'));
app.post('/api/array/traverse', (req, res) => {
  const steps = [`Start traversal at index 0.`];
  A.forEach((v, i) => steps.push(`At index ${i}, read the value ${v}. Process it, then move to index ${i + 1}.`));
  steps.push(`After visiting index ${A.length - 1}, there is no next index. Traversal terminates.`);
  response(res, 'Traversal', { array: A, steps, complexity: C('O(n)', 'O(1)', 'Every element is visited once.'), message: 'Array traversal completed.', highlight: A.map((_, i) => i) });
});

function linearSearch(a, target, res, operation = 'Linear Search') {
  if (!validNum(target)) return res.status(400).json({ error: 'Enter a numeric search value.' });
  const steps = [`Set the target value to ${target}.`, `Start from index 0 because linear search checks elements sequentially.`];
  let found = -1;
  a.forEach((v, i) => { if (found !== -1) return; steps.push(`Compare target ${target} with index ${i}, where value ${v} is stored.`); if (v === target) { found = i; steps.push(`The values are equal, so ${target} is found at index ${i}. Stop the search.`); } else steps.push(`${v} is not equal to ${target}, so move the pointer from index ${i} to index ${i + 1}.`); });
  if (found === -1) steps.push(`Every index has been checked and no element equals ${target}. The search ends unsuccessfully.`);
  response(res, operation, { array: a, steps, complexity: C('O(n)', 'O(1)', 'Worst case checks every element.'), message: found >= 0 ? `Found ${target} at index ${found}.` : `${target} was not found.`, found: found >= 0, index: found, highlight: found >= 0 ? [found] : [] });
}

// ---------------- LINKED LIST ----------------
app.post('/api/linked-list/create', (req, res) => {
  const values = Array.isArray(req.body.values) ? req.body.values.map(Number) : [];
  if (!values.length || values.some(Number.isNaN)) return res.status(400).json({ error: 'Enter numeric values for the linked list.' });
  L = values;
  const steps = [
    `The user entered ${L.length} values, so create ${L.length} separate nodes.`,
    `Each node contains two logical fields: DATA and NEXT.`,
    `Start with HEAD pointing to the first node.`
  ];
  L.forEach((v, i) => {
    steps.push(`Create node ${i}. Store ${v} in its DATA field.`);
    if (i < L.length - 1) steps.push(`Set node ${i}'s NEXT pointer to node ${i + 1}, where value ${L[i + 1]} is stored.`);
    else steps.push(`Node ${i} contains ${v}. It is the last node, so its NEXT pointer is NULL.`);
  });
  steps.push(`HEAD points to node 0, where ${L[0]} is stored.`);
  steps.push(`Following HEAD and then each NEXT pointer gives: ${L.join(' → ')} → NULL.`);
  response(res, 'Create Linked List', { array: L, steps, complexity: C('O(n)', 'O(n)', 'One node is required for every input value.'), message: `${L.length} nodes created.` });
});
app.post('/api/linked-list/insert', (req, res) => {
  const p = Number(req.body.position), v = Number(req.body.value);
  if (!Number.isInteger(p) || p < 0 || p > L.length) return res.status(400).json({ error: 'Invalid linked-list position.' });
  const before = L.slice(); const steps = [`Start at HEAD, which points to node 0.`];
  if (p === 0) steps.push(`Because the position is 0, create node ${v} and make it the new HEAD. Its NEXT points to the old first node.`);
  else { for (let i = 0; i < p; i++) steps.push(`At node ${i}, value ${L[i]} is stored. Follow its NEXT pointer to node ${i + 1}.`); steps.push(`Create a new node containing ${v}.`); steps.push(`Change the previous node's NEXT pointer so it points to the new node.`); steps.push(`Set the new node's NEXT pointer to the node that was previously at position ${p}.`); }
  L.splice(p, 0, v);
  steps.push(`The new linked-list order is ${L.join(' → ')} → NULL.`);
  response(res, 'Linked List Insertion', { array: L, steps, complexity: C(p === 0 ? 'O(1)' : 'O(n)', 'O(1) auxiliary', 'Finding a general position requires traversal.'), message: `Inserted ${v} at position ${p}.`, highlight: [p], meta: { position: p, value: v, before } });
});
app.post('/api/linked-list/delete', (req, res) => {
  const p = Number(req.body.position);
  if (!Number.isInteger(p) || p < 0 || p >= L.length) return res.status(400).json({ error: 'Invalid linked-list position.' });
  const before = L.slice(), x = L[p]; const steps = [`Begin at HEAD and follow NEXT pointers one node at a time.`];
  for (let i = 0; i <= p; i++) steps.push(`Visit node ${i}, where value ${L[i]} is stored.${i === p ? ' This is the target node.' : ' It is not the target, so continue through NEXT.'}`);
  if (p === 0) steps.push(`Move HEAD from the node containing ${x} to the next node.`); else { steps.push(`Keep the predecessor node at position ${p - 1}.`); steps.push(`Change its NEXT pointer so it skips the node containing ${x} and points directly to position ${p + 1 < L.length ? p + 1 : 'NULL'}.`); }
  L.splice(p, 1); steps.push(`Remove the target node ${x}.`); steps.push(`Following HEAD and NEXT now gives: ${L.join(' → ')}${L.length ? ' → NULL' : 'NULL'}.`);
  response(res, 'Linked List Deletion', { array: L, steps, complexity: C(p === 0 ? 'O(1)' : 'O(n)', 'O(1) auxiliary', 'Traversal is required for a general position.'), message: `Deleted ${x}.`, highlight: [], meta: { position: p, value: x, before } });
});
app.post('/api/linked-list/traverse', (req, res) => {
  const steps = [`Set a traversal pointer current = HEAD.`]; L.forEach((v, i) => steps.push(`current is at node ${i}. DATA = ${v}. Read the value, then follow NEXT to node ${i + 1 < L.length ? i + 1 : 'NULL'}.`)); steps.push('When current becomes NULL, the traversal stops.');
  response(res, 'Linked List Traversal', { array: L, steps, complexity: C('O(n)', 'O(1)', 'Every node is visited once.'), message: 'Linked-list traversal completed.' });
});
app.post('/api/linked-list/reverse', (req, res) => {
  const before = L.slice(), steps = [`Set three references: previous = NULL, current = HEAD, and next = NULL.`];
  before.forEach(v => steps.push(`At node ${v}, save its NEXT pointer, reverse the NEXT pointer so node ${v} points to the previous node, then advance current to the saved next node.`));
  L.reverse(); steps.push(`When current becomes NULL, move HEAD to the former tail. The new order is ${L.join(' → ')} → NULL.`);
  response(res, 'Reverse Linked List', { array: L, steps, complexity: C('O(n)', 'O(1) auxiliary', 'Links are reversed in place.'), message: 'Linked list reversed.', highlight: L.length ? [0] : [] });
});

// ---------------- STACK ----------------
function stackHandler(action, req, res) {
  const v = Number(req.body.value); const before = S.slice(); let result = null;
  if (action === 'push') {
    if (!validNum(v)) return res.status(400).json({ error: 'Enter a numeric value.' });
    const steps = [`A stack follows LIFO: Last In, First Out.`, `Read the current TOP, which is ${S.length ? S[S.length - 1] : 'empty'}.`, `Create a new stack element containing ${v}.`, `Place ${v} above the current TOP.`, `Update TOP so it points to ${v}.`]; S.push(v); steps.push(`Stack after PUSH: [${S.join(', ')}], with ${v} at TOP.`); result = { steps, message: `Pushed ${v}.`, highlight: [S.length - 1] };
  } else if (action === 'pop') {
    if (!S.length) return res.status(400).json({ error: 'Stack is empty.' }); const x = S[S.length - 1]; const steps = [`TOP currently points to ${x}.`, `Read the value ${x} from TOP.`, `Remove the top element from the stack.`, `Move TOP to the element immediately below ${x}, which is ${S.length > 1 ? S[S.length - 2] : 'empty'}.`]; S.pop(); steps.push(`Stack after POP: [${S.join(', ')}].`); result = { steps, message: `Popped ${x}.`, highlight: S.length ? [S.length - 1] : [] };
  } else if (action === 'peek') {
    if (!S.length) return res.status(400).json({ error: 'Stack is empty.' }); const x = S[S.length - 1]; const steps = [`PEEK does not modify the stack.`, `Read the TOP pointer.`, `TOP points to ${x}.`, `Return ${x} to the user while keeping every stack element unchanged.`]; result = { steps, message: `TOP is ${x}.`, highlight: [S.length - 1] };
  } else {
    const steps = ['Start at the bottom of the stack and read each stored element.']; S.forEach((x, i) => steps.push(`Stack position ${i} contains ${x}${i === S.length - 1 ? ' and this is TOP.' : '.'}`)); result = { steps, message: 'Stack displayed.', highlight: S.map((_, i) => i) };
  }
  response(res, `Stack ${action}`, { array: S, steps: result.steps, complexity: C(action === 'display' ? 'O(n)' : 'O(1)', 'O(1)', 'TOP access is constant time.'), message: result.message, highlight: result.highlight, meta: { before, value: v } });
}
['push','pop','peek','display'].forEach(a => app.post('/api/stack/' + a, (req,res) => stackHandler(a,req,res)));

// ---------------- QUEUE ----------------
function queueHandler(action, req, res) {
  const v = Number(req.body.value); const before = Q.slice(); let result;
  if (action === 'enqueue') { if (!validNum(v)) return res.status(400).json({ error:'Enter a numeric value.' }); const steps=[`A queue follows FIFO: First In, First Out.`,`REAR currently points to ${Q.length ? Q[Q.length-1] : 'empty'}.`,`Create a new element containing ${v}.`,`Attach ${v} after the current REAR.`,`Move REAR to ${v}.`]; Q.push(v); steps.push(`Queue after ENQUEUE: [${Q.join(', ')}].`); result={steps,message:`Enqueued ${v}.`,highlight:[Q.length-1]}; }
  else if(action==='dequeue'){if(!Q.length)return res.status(400).json({error:'Queue is empty.'});const x=Q[0];const steps=[`FRONT points to ${x}.`,`Read the oldest element at FRONT.`,`Remove ${x} from the front.`,`Move FRONT to the next element, ${Q.length>1?Q[1]:'empty'}.`];Q.shift();steps.push(`Queue after DEQUEUE: [${Q.join(', ')}].`);result={steps,message:`Dequeued ${x}.`,highlight:Q.length?[0]:[]};}
  else if(action==='front'){if(!Q.length)return res.status(400).json({error:'Queue is empty.'});const x=Q[0];result={steps:[`FRONT points to the first queue element.`,`Read FRONT: ${x}.`,`No element is removed or moved because FRONT only reads the value.`],message:`FRONT is ${x}.`,highlight:[0]};}
  else {result={steps:[`Start at FRONT and inspect each queue position.`,...Q.map((x,i)=>`Position ${i} contains ${x}${i===0?' and is FRONT.':i===Q.length-1?' and is REAR.':'.'}`)],message:'Queue displayed.',highlight:Q.map((_,i)=>i)};}
  response(res,`Queue ${action}`,{array:Q,steps:result.steps,complexity:C(action==='display'?'O(n)':'O(1)','O(1)','Front/rear operations are constant time in the conceptual queue.'),message:result.message,highlight:result.highlight,meta:{before,value:v}});
}
['enqueue','dequeue','front','display'].forEach(a=>app.post('/api/queue/'+a,(req,res)=>queueHandler(a,req,res)));

// ---------------- TREE ----------------
class Node { constructor(value){ this.value=value; this.left=null; this.right=null; this.id=Node.next++; } }
Node.next=1;
function insertNode(node,v,steps){ if(!node){steps.push(`There is no node at this position, so create a new node containing ${v}.`);return new Node(v);} if(v<node.value){steps.push(`Compare ${v} with ${node.value}. Since ${v} < ${node.value}, move to the LEFT child.`);node.left=insertNode(node.left,v,steps);}else{steps.push(`Compare ${v} with ${node.value}. Since ${v} >= ${node.value}, move to the RIGHT child.`);node.right=insertNode(node.right,v,steps);}return node; }
function treeNodes(n,out=[]){if(!n)return out;out.push({id:n.id,value:n.value,left:n.left?.id||null,right:n.right?.id||null});treeNodes(n.left,out);treeNodes(n.right,out);return out;}
function traversal(n,type,out=[]){if(!n)return out;if(type==='pre')out.push(n.value);traversal(n.left,type,out);if(type==='in')out.push(n.value);traversal(n.right,type,out);if(type==='post')out.push(n.value);return out;}
app.post('/api/tree/insert',(req,res)=>{const v=Number(req.body.value);if(!validNum(v))return res.status(400).json({error:'Enter a numeric value.'});const steps=[`Start at the ROOT and compare the new value ${v} with the current node.`];T=insertNode(T,v,steps);steps.push(`The node containing ${v} is now connected at its correct binary-search-tree position.`);response(res,'Tree Insertion',{nodes:treeNodes(T),steps,complexity:C('O(log n) average / O(n) worst','O(h)','h is tree height.'),message:`Inserted ${v}.`,highlight:[v]});});
['inorder','preorder','postorder'].forEach(a=>app.post('/api/tree/'+a,(req,res)=>{const type=a==='inorder'?'in':a==='preorder'?'pre':'post';const vals=traversal(T,type,[]);const steps=[`Start the ${a} traversal from the root.`];vals.forEach((v,i)=>steps.push(`Visit node ${i+1}: value ${v}. Record it in the ${a} traversal sequence.`));steps.push(`Traversal result: ${vals.join(' → ')}.`);response(res,a,{nodes:treeNodes(T),steps,complexity:C('O(n)','O(h)','Every node is visited.'),message:`${a} traversal completed.`,highlight:vals});}));
app.post('/api/tree/search',(req,res)=>{const v=Number(req.body.value);if(!validNum(v))return res.status(400).json({error:'Enter a numeric value.'});let n=T,steps=[`Start at the ROOT. The target value is ${v}.`],found=false;while(n){steps.push(`Compare ${v} with current node ${n.value}.`);if(v===n.value){found=true;steps.push(`The values are equal. ${v} is found at this node, so stop searching.`);break;}if(v<n.value){steps.push(`${v} is smaller than ${n.value}, so move to the LEFT child.`);n=n.left;}else{steps.push(`${v} is greater than ${n.value}, so move to the RIGHT child.`);n=n.right;}}if(!found)steps.push(`The search reached NULL. No node contains ${v}.`);response(res,'Tree Search',{nodes:treeNodes(T),steps,complexity:C('O(log n) average / O(n) worst','O(1) auxiliary','Depends on tree height.'),message:found?`Found ${v}.`:`${v} not found.`,found,highlight:found?[v]:[]});});

// ---------------- GRAPH ----------------
app.post('/api/graph/addVertex',(req,res)=>{const v=String(req.body.vertex||'').trim();if(!v)return res.status(400).json({error:'Enter a vertex label.'});if(!G.nodes.includes(v))G.nodes.push(v);response(res,'Add Vertex',{graph:G,steps:[`Create vertex ${v}.`,`Store vertex ${v} in the graph's vertex collection.`,`The vertex currently has ${G.edges.filter(e=>e.includes(v)).length} connection(s).`],complexity:C('O(1) average','O(1)','Adds one vertex.'),message:`Vertex ${v} added.`,highlight:[v]});});
app.post('/api/graph/addEdge',(req,res)=>{const a=String(req.body.from||'').trim(),b=String(req.body.to||'').trim();if(!a||!b||a===b)return res.status(400).json({error:'Enter two different vertices.'});[a,b].forEach(v=>{if(!G.nodes.includes(v))G.nodes.push(v)});if(!G.edges.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a)))G.edges.push([a,b]);response(res,'Add Edge',{graph:G,steps:[`Locate vertex ${a}.`,`Locate vertex ${b}.`,`Create an undirected edge between ${a} and ${b}.`,`Store the connection as ${a} ↔ ${b}.`],complexity:C('O(1) average','O(1)','Adds one edge.'),message:`Edge ${a} ↔ ${b} added.`,highlight:[a,b]});});
function adjacency(){const ad={};G.nodes.forEach(v=>ad[v]=[]);G.edges.forEach(([a,b])=>{ad[a].push(b);ad[b].push(a)});return ad;}
function graphWalk(start,type){const ad=adjacency();if(!ad[start])return {order:[],steps:[`Vertex ${start} does not exist in the graph.`]};const seen=new Set(),work=[start],order=[],steps=[`Mark ${start} as visited and place it in the ${type==='BFS'?'queue':'stack'}.`];while(work.length){const x=type==='BFS'?work.shift():work.pop();if(seen.has(x))continue;seen.add(x);order.push(x);steps.push(`Remove ${x} from the ${type==='BFS'?'front of the queue':'top of the stack'} and visit it.`);for(const n of ad[x])if(!seen.has(n)){work.push(n);steps.push(`Discover neighbor ${n} from ${x} and add it to the ${type==='BFS'?'queue':'stack'}.`);}}steps.push(`Traversal order: ${order.join(' → ')}.`);return {order,steps};}
['bfs','dfs'].forEach(a=>app.post('/api/graph/'+a,(req,res)=>{const start=String(req.body.start||'').trim(),type=a.toUpperCase(),r=graphWalk(start,type);response(res,type,{graph:G,steps:r.steps,complexity:C('O(V + E)','O(V)','Each vertex and edge is processed at most once.'),message:r.order.length?`${type} completed.`:`${start} is not a valid start vertex.`,highlight:r.order});}));

// ---------------- HASHING ----------------
app.post('/api/hashing/:action',(req,res)=>{const action=req.params.action,k=Number(req.body.key);if(!Number.isInteger(k))return res.status(400).json({error:'Enter an integer key.'});const index=Math.abs(k)%10;let steps=[`Take the key ${k}.`,`Apply the hash function: index = |${k}| % 10 = ${index}.`,`Move to bucket ${index}.`];let message;
if(action==='insert'){if(!H[index].includes(k))H[index].push(k);steps.push(`Check bucket ${index}. If another key is already there, this is a collision and separate chaining keeps both keys in the same bucket.`);steps.push(`Store ${k} in bucket ${index}.`);message=`Inserted ${k} into bucket ${index}.`;}
else if(action==='delete'){const p=H[index].indexOf(k);steps.push(`Inspect the chain stored in bucket ${index}.`);if(p>=0){H[index].splice(p,1);steps.push(`The key ${k} is present, so remove it from the chain.`);message=`Deleted ${k}.`;}else{steps.push(`The key ${k} is not present in this bucket.`);message=`${k} not found.`;}}
else if(action==='search'){const found=H[index].includes(k);steps.push(`Compare the target key with each key in bucket ${index}.`);steps.push(found?`A matching key ${k} is found, so the search succeeds.`:`No matching key is found in the chain, so the search fails.`);return response(res,'Hash Search',{buckets:H,steps,complexity:C('O(1) average / O(n) worst','O(1) auxiliary','Worst case occurs when many keys collide.'),message:found?`Found ${k}.`:`${k} not found.`,found,highlight:index});}
else {steps=[`Display all ten buckets from index 0 to index 9.`,...H.map((b,i)=>`Bucket ${i} contains: ${b.length?b.join(' → '):'empty'}.`)];message='Hash table displayed.';}
response(res,'Hash '+action,{buckets:H,steps,complexity:C(action==='display'?'O(n)':'O(1) average / O(n) worst','O(1) auxiliary','Separate chaining handles collisions.'),message,highlight:index});});

// ---------------- SEARCHING ----------------
app.post('/api/searching/linear',(req,res)=>{const a=(req.body.values||[]).map(Number);const v=Number(req.body.value);linearSearch(a,v,res,'Linear Search');});
app.post('/api/searching/binary',(req,res)=>{let a=(req.body.values||[]).map(Number).sort((x,y)=>x-y);const v=Number(req.body.value);if(!validNum(v))return res.status(400).json({error:'Enter a numeric search value.'});let l=0,h=a.length-1,found=-1;const steps=[`Binary search requires sorted data, so arrange the input in ascending order: [${a.join(', ')}].`,`Set LEFT = 0 and RIGHT = ${h}.`,`The active search range is from index LEFT to RIGHT.`];while(l<=h){const m=Math.floor((l+h)/2);steps.push(`Calculate MID = floor((${l} + ${h}) / 2) = ${m}.`);steps.push(`Check index ${m}, where value ${a[m]} is stored, and compare it with ${v}.`);if(a[m]===v){found=m;steps.push(`The middle value ${a[m]} equals ${v}. The element is found at index ${m}.`);break;}if(a[m]<v){steps.push(`${a[m]} is smaller than ${v}, so discard the left half including index ${m}. Set LEFT = ${m+1}.`);l=m+1;}else{steps.push(`${a[m]} is larger than ${v}, so discard the right half including index ${m}. Set RIGHT = ${m-1}.`);h=m-1;}}if(found<0)steps.push(`LEFT has crossed RIGHT. No valid search range remains, so ${v} is not present.`);response(res,'Binary Search',{array:a,steps,complexity:C('O(log n)','O(1)','The search range is halved after each comparison.'),message:found>=0?`Found ${v} at index ${found}.`:`${v} was not found.`,found:found>=0,index:found,highlight:found>=0?[found]:[]});});

// ---------------- SORTING ----------------
function bubbleSort(input){let a=input.slice(),steps=[`Start with the unsorted array: [${a.join(', ')}].`],frames=[];for(let pass=0;pass<a.length-1;pass++){steps.push(`Begin pass ${pass+1}. The largest unsorted value will move toward the right end.`);for(let j=0;j<a.length-pass-1;j++){steps.push(`Compare adjacent values ${a[j]} at index ${j} and ${a[j+1]} at index ${j+1}.`);if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];steps.push(`They are out of order, so swap them. Current array: [${a.join(', ')}].`);}else steps.push(`They are already in increasing order, so no swap is needed.`);}}steps.push(`All passes are complete. Final sorted array: [${a.join(', ')}].`);return [a,steps];}
function selectionSort(input){let a=input.slice(),steps=[`Start with the unsorted array: [${a.join(', ')}].`];for(let i=0;i<a.length-1;i++){let min=i;steps.push(`For position ${i}, assume ${a[i]} is the smallest remaining value.`);for(let j=i+1;j<a.length;j++){steps.push(`Compare candidate ${a[j]} at index ${j} with current minimum ${a[min]}.`);if(a[j]<a[min]){min=j;steps.push(`${a[j]} is smaller, so make index ${j} the new minimum.`);}}if(min!==i){steps.push(`Swap the value at index ${i} with the minimum at index ${min}.`);[a[i],a[min]]=[a[min],a[i]];steps.push(`Current array: [${a.join(', ')}].`);}else steps.push(`The value at index ${i} is already the minimum, so no swap is required.`);}steps.push(`Final sorted array: [${a.join(', ')}].`);return [a,steps];}
function insertionSort(input){let a=input.slice(),steps=[`Start with the unsorted array: [${a.join(', ')}].`,`Treat the first element at index 0 as a sorted section.`];for(let i=1;i<a.length;i++){const key=a[i];let j=i-1;steps.push(`Take ${key} as the KEY at index ${i}.`);while(j>=0&&a[j]>key){steps.push(`${a[j]} is greater than KEY ${key}, so shift ${a[j]} from index ${j} to index ${j+1}.`);a[j+1]=a[j];j--;}a[j+1]=key;steps.push(`Insert KEY ${key} at index ${j+1}. Sorted section is now [${a.slice(0,i+1).join(', ')}].`);steps.push(`Current full array: [${a.join(', ')}].`);}steps.push(`Final sorted array: [${a.join(', ')}].`);return [a,steps];}
for(const type of ['bubble','selection','insertion'])app.post('/api/sorting/'+type,(req,res)=>{const input=(req.body.values||[]).map(Number);if(!input.length||input.some(Number.isNaN))return res.status(400).json({error:'Enter a numeric array.'});let out,steps;if(type==='bubble')[out,steps]=bubbleSort(input);else if(type==='selection')[out,steps]=selectionSort(input);else [out,steps]=insertionSort(input);response(res,type[0].toUpperCase()+type.slice(1)+' Sort',{array:out,steps,complexity:C('O(n²)','O(1) auxiliary','Comparison-based in-place sorting.'),message:`Sorting completed. Final array: [${out.join(', ')}].`,meta:{before:input}});});


// ---------------- DOUBLY LINKED LIST ----------------
app.post('/api/doubly-linked-list/create', (req, res) => {
  const values = Array.isArray(req.body.values) ? req.body.values.map(Number) : [];
  if (!values.length || values.some(Number.isNaN)) return res.status(400).json({ error: 'Enter numeric values for the doubly linked list.' });
  DL = values;
  const steps = [
    `Create ${DL.length} nodes. Each node has DATA, PREV and NEXT fields.`,
    `HEAD points to node 0 and node 0 PREV is NULL.`
  ];
  DL.forEach((v, i) => {
    if (i === 0) steps.push(`Node 0 stores DATA = ${v}. PREV = NULL and NEXT points to node 1.`);
    else if (i === DL.length - 1) steps.push(`Node ${i} stores DATA = ${v}. PREV points to node ${i - 1} and NEXT = NULL.`);
    else steps.push(`Node ${i} stores DATA = ${v}. PREV → node ${i - 1}; NEXT → node ${i + 1}.`);
  });
  steps.push(`Forward traversal: ${DL.join(' → ')} → NULL.`);
  steps.push(`Backward traversal: NULL ← ${DL.slice().reverse().join(' ← ')}.`);
  response(res, 'Create Doubly Linked List', {
    array: DL,
    steps,
    complexity: C('O(n)', 'O(n)', 'Creating n nodes requires visiting/storing n values.'),
    message: `${DL.length} doubly linked-list nodes created.`,
    highlight: DL.map((_, i) => i)
  });
});

app.post('/api/doubly-linked-list/insert', (req, res) => {
  const p = Number(req.body.position), v = Number(req.body.value);
  if (!Number.isInteger(p) || p < 0 || p > DL.length) return res.status(400).json({ error: 'Invalid doubly linked-list position.' });
  const before = DL.slice();
  const steps = [`Start from HEAD and follow NEXT pointers until position ${p}.`];
  if (p === 0) {
    steps.push(`Create a new node containing ${v}. Its PREV becomes NULL.`);
    steps.push(`Set its NEXT to the old HEAD and update the old HEAD PREV to the new node.`);
  } else {
    for (let i = 0; i < p; i++) steps.push(`Visit node ${i}, DATA = ${DL[i]}. Follow NEXT to the next node.`);
    steps.push(`Create a new node containing ${v}.`);
    steps.push(`Set new PREV → node ${p - 1} and new NEXT → node ${p < DL.length ? p : 'NULL'}.`);
    steps.push(`Update the predecessor's NEXT and successor's PREV links.`);
  }
  DL.splice(p, 0, v);
  steps.push(`Result: ${DL.join(' ⇄ ')}.`);
  response(res, 'Doubly Linked List Insertion', {
    array: DL, steps,
    complexity: C(p === 0 ? 'O(1)' : 'O(n)', 'O(1) auxiliary', 'Finding a general position requires traversal; relinking known neighboring nodes is constant time.'),
    message: `Inserted ${v} at position ${p}.`,
    highlight: [p],
    meta: { position: p, value: v, before }
  });
});

app.post('/api/doubly-linked-list/delete', (req, res) => {
  const p = Number(req.body.position);
  if (!Number.isInteger(p) || p < 0 || p >= DL.length) return res.status(400).json({ error: 'Invalid doubly linked-list position.' });
  const before = DL.slice(), x = DL[p];
  const steps = [`Traverse to node ${p}, where DATA = ${x}.`];
  if (p > 0) steps.push(`Use PREV to reach node ${p - 1} and redirect its NEXT pointer.`);
  if (p < DL.length - 1) steps.push(`Use NEXT to reach node ${p + 1} and redirect its PREV pointer.`);
  if (p === 0) steps.push(`Move HEAD to the next node and set the new HEAD PREV to NULL.`);
  if (p === DL.length - 1) steps.push(`The predecessor becomes the new tail and its NEXT becomes NULL.`);
  DL.splice(p, 1);
  steps.push(`Remove node ${x}. Result: ${DL.length ? DL.join(' ⇄ ') : 'empty'}.`);
  response(res, 'Doubly Linked List Deletion', {
    array: DL, steps,
    complexity: C(p === 0 ? 'O(1)' : 'O(n)', 'O(1) auxiliary', 'Traversal to an arbitrary position costs O(n); pointer relinking itself is O(1).'),
    message: `Deleted ${x}.`,
    highlight: [],
    meta: { position: p, value: x, before }
  });
});

app.post('/api/doubly-linked-list/traverse', (req, res) => {
  const steps = [`Start at HEAD and follow NEXT pointers forward.`];
  DL.forEach((v, i) => steps.push(`Visit node ${i}: DATA = ${v}. NEXT ${i < DL.length - 1 ? 'moves to node ' + (i + 1) : 'is NULL, so forward traversal ends'}.`));
  steps.push(`Now use PREV from the last node to traverse backward.`);
  response(res, 'Doubly Linked List Traversal', {
    array: DL, steps,
    complexity: C('O(n)', 'O(1)', 'Every node is visited during traversal.'),
    message: 'Forward and backward traversal completed.',
    highlight: DL.map((_, i) => i)
  });
});

app.post('/api/doubly-linked-list/reverse', (req, res) => {
  DL.reverse();
  const steps = [
    `Reverse the logical order by swapping the direction of traversal.`,
    `The new HEAD is the previous tail.`,
    `Forward order is now: ${DL.join(' → ')} → NULL.`,
    `Following PREV from the tail gives: ${DL.slice().reverse().join(' ← ')}.`
  ];
  response(res, 'Doubly Linked List Reverse', {
    array: DL, steps,
    complexity: C('O(n)', 'O(1)', 'The list order is reversed by visiting n elements.'),
    message: 'Doubly linked list reversed.',
    highlight: DL.map((_, i) => i)
  });
});

// ---------------- RESET ----------------
function reset(m){if(m==='array')A=[];if(m==='linked-list')L=[];if(m==='doubly-linked-list')DL=[];if(m==='stack')S=[];if(m==='queue')Q=[];if(m==='tree'){T=null;Node.next=1;}if(m==='graph')G={nodes:[],edges:[]};if(m==='hashing')H=Array.from({length:10},()=>[]);}
for(const m of ['array','linked-list','doubly-linked-list','stack','queue','tree','graph','hashing','searching','sorting'])app.post('/api/'+m+'/reset',(req,res)=>{reset(m);if(m==='array'||m==='linked-list'||m==='doubly-linked-list'||m==='stack'||m==='queue'||m==='searching'||m==='sorting')return res.json({array:[]});if(m==='tree')return res.json({nodes:[]});if(m==='graph')return res.json({graph:G});return res.json({buckets:H});});

app.listen(PORT,()=>console.log(`DataVerse API running on http://localhost:${PORT}`));
