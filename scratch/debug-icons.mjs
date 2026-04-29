import * as icons from 'lucide';

const iconName = 'Building';
const IconNode = icons[iconName];

console.log('IconNode type:', typeof IconNode);
console.log('Is Array:', Array.isArray(IconNode));
console.log('Content:', JSON.stringify(IconNode, null, 2));
