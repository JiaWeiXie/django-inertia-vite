import 'vite/modulepreload-polyfill';
import 'bootstrap/dist/css/bootstrap.min.css';
import {createInertiaApp} from '@inertiajs/inertia-react';
import {render} from "react-dom";


createInertiaApp({
  resolve: name => import(`./pages/${name}.tsx`),
  setup({el, App, props}) {
    render(<App {...props} />, el)
  },
})
