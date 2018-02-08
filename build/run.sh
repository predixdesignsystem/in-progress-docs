#!/bin/bash

git clone https://github.com/vaadin/px-data-grid.git
git clone https://github.com/vaadin/px-vis-boxplot.git
git clone https://github.com/vaadin/px-vis-heatmap.git
node build.js px-data-grid
node build.js px-vis-boxplot
node build.js px-vis-heatmap
node make-index.js
