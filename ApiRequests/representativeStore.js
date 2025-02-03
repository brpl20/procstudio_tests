let representativeNames = [];

function setRepresentativeNames(names) {
  representativeNames = names;
}

function getRepresentativeNames() {
  return representativeNames;
}

module.exports = {
  setRepresentativeNames,
  getRepresentativeNames
};