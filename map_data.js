var map_templates = [
	{
		len:1000,
		height:1000,
		blocks:[
			{l:300,b:300,r:700,t:700}
		],
		prev_map:[500,995],
		next_map:[500,5]
	},
	{
		len:1000,
		height:1000,
		blocks:[
			{l:100,b:450,r:900,t:550}
		],
		prev_map:[500,995],
		next_map:[500,5]
	}
]

function make_map(location) {
	return (map_templates[location%(map_templates.length)])
}