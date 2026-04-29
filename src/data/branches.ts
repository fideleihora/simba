export const branches = [
  { id: '1', name: 'Simba City Center (UTC)' },
  { id: '2', name: 'Simba Gishushu' },
  { id: '3', name: 'Simba Nyarutarama' },
  { id: '4', name: 'Simba Kimironko' },
  { id: '5', name: 'Simba Kicukiro' },
  { id: '6', name: 'Simba Nyamirambo' },
  { id: '7', name: 'Simba Kimihurura' },
  { id: '8', name: 'Simba Kanombe' },
  { id: '9', name: 'Simba Gisozi' },
  { id: '10', name: 'Simba Gisenyi' },
];

export const getBranchName = (id: string) => {
  return branches.find(b => b.id === id)?.name || `Branch ${id}`;
};

export const getBranchIdByName = (name: string) => {
  return branches.find(b => b.name === name)?.id;
};
