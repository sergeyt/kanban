# build cumulative flow diagram (chart definition for d3-gems)
build_cfd = ->
	chart =
		type: 'cfd'
		axes:
			x: { majorTicks: "outside" }
			y: {
				majorTicks: "outside"
				scalar: true
				margin: true
				grid: { major: true, minor: false }
			}
		series:
			active: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
			doing: [0, 2, 4, 5, 7, 8, 9, 10, 10, 10],
			review: [0, 0, 2, 3, 5, 6, 7, 8, 9, 10],
			test: [0, 0, 0, 2, 2, 4, 6, 7, 9, 10],
			done: [0, 0, 0, 0, 2, 2, 4, 6, 8, 10]
		title:
			text: 'Cumulative Flow Diagram'
			position: 'center'
		legend:
			position: 'topright'

	# todo gather series from WorkItems

	chart

Template.dashboard.rendered = ->
	chart = build_cfd()
	$(@find('.cfd')).data('chart', chart).chart()
