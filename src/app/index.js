import React from 'react';
import {render} from 'react-dom';
import Layout from './components/Layout';
import Autocomplete from './components/Autocomplete';
require('./styles/main.scss');

render(
  <Layout>
    <Autocomplete />
  </Layout>,
  document.getElementById('app')
);
