/*Skip to content
This repository
Search
Pull requests
Issues
Marketplace
Gist
 @hiitsherby
 Sign out
 Watch 1,274
  Star 30,773
  Fork 7,858 chartjs/Chart.js
 Code  Issues 264  Pull requests 26  Projects 8 Insights 
Branch: master Find file Copy pathChart.js/samples/utils.js
4b421a5  on Mar 18
@simonbrunel simonbrunel Add support to fill between datasets (#4008)
2 contributors @simonbrunel @etimberg
RawBlameHistory     
120 lines (99 sloc)  2.54 KB
/* global Chart */

'use strict';

window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

window.randomScalingFactor = function() {
	return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
};

(function(global) {
	var Months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	var Samples = global.Samples || (global.Samples = {});
	Samples.utils = {
		// Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
		srand: function(seed) {
			this._seed = seed;
		},

		rand: function(min, max) {
			var seed = this._seed;
			min = min === undefined? 0 : min;
			max = max === undefined? 1 : max;
			this._seed = (seed * 9301 + 49297) % 233280;
			return min + (this._seed / 233280) * (max - min);
		},

		numbers: function(config) {
			var cfg = config || {};
			var min = cfg.min || 0;
			var max = cfg.max || 1;
			var from = cfg.from || [];
			var count = cfg.count || 8;
			var decimals = cfg.decimals || 8;
			var continuity = cfg.continuity || 1;
			var dfactor = Math.pow(10, decimals) || 0;
			var data = [];
			var i, value;

			for (i=0; i<count; ++i) {
				value = (from[i] || 0) + this.rand(min, max);
				if (this.rand() <= continuity) {
					data.push(Math.round(dfactor * value) / dfactor);
				} else {
					data.push(null);
				}
			}

			return data;
		},

		labels: function(config) {
			var cfg = config || {};
			var min = cfg.min || 0;
			var max = cfg.max || 100;
			var count = cfg.count || 8;
			var step = (max-min) / count;
			var decimals = cfg.decimals || 8;
			var dfactor = Math.pow(10, decimals) || 0;
			var prefix = cfg.prefix || '';
			var values = [];
			var i;

			for (i=min; i<max; i+=step) {
				values.push(prefix + Math.round(dfactor * i) / dfactor);
			}

			return values;
		},

		months: function(config) {
			var cfg = config || {};
			var count = cfg.count || 12;
			var section = cfg.section;
			var values = [];
			var i, value;

			for (i=0; i<count; ++i) {
				value = Months[Math.ceil(i)%12];
				values.push(value.substring(0, section));
			}

			return values;
		},

		transparentize: function(color, opacity) {
			var alpha = opacity === undefined? 0.5 : 1 - opacity;
			return Chart.helpers.color(color).alpha(alpha).rgbString();
		},

		merge: Chart.helpers.configMerge
	};

	Samples.utils.srand(Date.now());

}(this));

/*Contact GitHub API Training Shop Blog About
© 2017 GitHub, Inc. Terms Privacy Security Status Help*/