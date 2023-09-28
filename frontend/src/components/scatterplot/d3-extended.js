import * as d3code from 'd3'; // Import the base D3.js library
// import * as d3lasso from './d3-lasso-adapted'; // Import d3-lasso (assuming it's installed as a dependency)
import * as d3lasso from 'd3-lasso';

const d3 = Object.assign(d3code, { lasso: d3lasso.lasso });
window.d3 = d3;

export default d3;