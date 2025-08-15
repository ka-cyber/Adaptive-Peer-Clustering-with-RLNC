// Application data
const simulationData = {
    "network_config": {
        "num_nodes": 30,
        "connection_probability": 0.3,
        "generation_size": 32,
        "churn_rate": 0.02,
        "finite_field_size": 256
    },
    "final_nodes": [
        {"node_id": 0, "is_active": true, "bandwidth": 548.7135, "latency": 75.7836, "ewma_pdr": 0.8099, "cluster_id": 0},
        {"node_id": 4, "is_active": true, "bandwidth": 945.3102, "latency": 68.2655, "ewma_pdr": 0.8103, "cluster_id": 1},
        {"node_id": 6, "is_active": true, "bandwidth": 779.9758, "latency": 32.4621, "ewma_pdr": 0.9277, "cluster_id": 1},
        {"node_id": 8, "is_active": true, "bandwidth": 827.0852, "latency": 74.4588, "ewma_pdr": 0.8103, "cluster_id": 3},
        {"node_id": 11, "is_active": true, "bandwidth": 827.1014, "latency": 74.4588, "ewma_pdr": 0.8103, "cluster_id": 3},
        {"node_id": 12, "is_active": true, "bandwidth": 675.3097, "latency": 58.6651, "ewma_pdr": 0.6670, "cluster_id": 2},
        {"node_id": 14, "is_active": true, "bandwidth": 622.7100, "latency": 74.8187, "ewma_pdr": 0.8099, "cluster_id": 2},
        {"node_id": 18, "is_active": true, "bandwidth": 696.3526, "latency": 93.5946, "ewma_pdr": 0.8103, "cluster_id": 1},
        {"node_id": 20, "is_active": true, "bandwidth": 374.1702, "latency": 37.3499, "ewma_pdr": 0.8103, "cluster_id": 2},
        {"node_id": 22, "is_active": true, "bandwidth": 488.8525, "latency": 75.7836, "ewma_pdr": 0.8099, "cluster_id": 2},
        {"node_id": 27, "is_active": true, "bandwidth": 945.3102, "latency": 68.2655, "ewma_pdr": 0.8103, "cluster_id": 1},
        {"node_id": 28, "is_active": true, "bandwidth": 418.0156, "latency": 50.9998, "ewma_pdr": 0.8103, "cluster_id": 0}
    ],
    "performance_data": [
        {"step": 0, "adaptive_resilience": 1.0, "adaptive_pdr": 0.941, "baseline_resilience": 1.0, "baseline_pdr": 0.941},
        {"step": 10, "adaptive_resilience": 0.767, "adaptive_pdr": 0.814, "baseline_resilience": 0.8, "baseline_pdr": 0.807},
        {"step": 20, "adaptive_resilience": 0.567, "adaptive_pdr": 0.808, "baseline_resilience": 0.633, "baseline_pdr": 0.729},
        {"step": 30, "adaptive_resilience": 0.467, "adaptive_pdr": 0.79, "baseline_resilience": 0.6, "baseline_pdr": 0.704},
        {"step": 40, "adaptive_resilience": 0.433, "adaptive_pdr": 0.805, "baseline_resilience": 0.6, "baseline_pdr": 0.686},
        {"step": 49, "adaptive_resilience": 0.4, "adaptive_pdr": 0.792, "baseline_resilience": 0.6, "baseline_pdr": 0.676}
    ],
    "cluster_stats": [
        {"cluster_id": 0, "nodes": 3, "avg_bandwidth": 418.0, "avg_pdr": 0.842},
        {"cluster_id": 1, "nodes": 2, "avg_bandwidth": 946.8, "avg_pdr": 0.790},
        {"cluster_id": 2, "nodes": 5, "avg_bandwidth": 675.6, "avg_pdr": 0.731},
        {"cluster_id": 3, "nodes": 2, "avg_bandwidth": 827.5, "avg_pdr": 0.871}
    ],
    "final_metrics": {
        "active_nodes_adaptive": 12,
        "active_nodes_baseline": 18,
        "resilience_improvement": -31.46,
        "pdr_improvement": 0.78,
        "redundancy_improvement": 1.36
    }
};

// Global variables
let performanceChart, comparisonChart;
let networkSvg, simulation;
let isPlaying = false;
let currentStep = 0;
let animationTimeout;

// Cluster colors
const clusterColors = ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F'];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing application...');
    initializeTabs();
    initializeNetworkVisualization();
    initializeCharts();
    populateClusterStats();
    initializeControls();
    console.log('Application initialized');
});

// Tab functionality
function initializeTabs() {
    console.log('Initializing tabs...');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    console.log('Found', tabBtns.length, 'tab buttons and', tabContents.length, 'tab contents');

    tabBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.getAttribute('data-tab');
            console.log('Tab clicked:', target);
            
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active classes
            btn.classList.add('active');
            const targetContent = document.getElementById(target);
            if (targetContent) {
                targetContent.classList.add('active');
                console.log('Activated tab:', target);
            } else {
                console.error('Target content not found:', target);
            }
            
            // Handle specific tab activations
            if (target === 'performance') {
                setTimeout(() => {
                    if (performanceChart) {
                        performanceChart.resize();
                        console.log('Performance chart resized');
                    }
                    if (comparisonChart) {
                        comparisonChart.resize();
                        console.log('Comparison chart resized');
                    }
                }, 100);
            }
        });
    });
    console.log('Tab initialization complete');
}

// Network visualization
function initializeNetworkVisualization() {
    console.log('Initializing network visualization...');
    const container = document.getElementById('networkGraph');
    if (!container) {
        console.error('Network graph container not found');
        return;
    }
    
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;
    console.log('Network dimensions:', width, 'x', height);

    // Create SVG
    networkSvg = d3.select('#networkGraph')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'node-tooltip')
        .style('opacity', 0);

    // Generate network data
    const nodes = simulationData.final_nodes.map(node => ({
        ...node,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50
    }));

    // Generate connections (simple approach for demo)
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (Math.random() < simulationData.network_config.connection_probability) {
                links.push({
                    source: nodes[i],
                    target: nodes[j]
                });
            }
        }
    }

    console.log('Generated', nodes.length, 'nodes and', links.length, 'links');

    // Create force simulation
    simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).distance(80).strength(0.1))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.bandwidth) / 10 + 10));

    // Create links
    const link = networkSvg.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('class', 'link');

    // Create nodes
    const node = networkSvg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('class', 'node')
        .attr('r', d => Math.sqrt(d.bandwidth) / 15 + 8)
        .attr('fill', d => clusterColors[d.cluster_id] || '#888')
        .on('mouseover', (event, d) => {
            tooltip.transition().duration(200).style('opacity', .9);
            tooltip.html(`
                <strong>Node ${d.node_id}</strong><br/>
                Cluster: ${d.cluster_id}<br/>
                Bandwidth: ${d.bandwidth.toFixed(1)}<br/>
                Latency: ${d.latency.toFixed(1)}ms<br/>
                PDR: ${d.ewma_pdr.toFixed(3)}
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
            tooltip.transition().duration(500).style('opacity', 0);
        })
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    // Update positions
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    console.log('Network visualization initialized');
}

// Initialize charts
function initializeCharts() {
    console.log('Initializing charts...');
    initializePerformanceChart();
    initializeComparisonChart();
    console.log('Charts initialized');
}

function initializePerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) {
        console.error('Performance chart canvas not found');
        return;
    }
    
    performanceChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: simulationData.performance_data.map(d => `Step ${d.step}`),
            datasets: [
                {
                    label: 'Adaptive Resilience',
                    data: simulationData.performance_data.map(d => d.adaptive_resilience),
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Baseline Resilience',
                    data: simulationData.performance_data.map(d => d.baseline_resilience),
                    borderColor: '#B4413C',
                    backgroundColor: 'rgba(180, 65, 60, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Adaptive PDR',
                    data: simulationData.performance_data.map(d => d.adaptive_pdr),
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Baseline PDR',
                    data: simulationData.performance_data.map(d => d.baseline_pdr),
                    borderColor: '#5D878F',
                    backgroundColor: 'rgba(93, 135, 143, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0.3,
                    max: 1.0
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    console.log('Performance chart created');
}

function initializeComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) {
        console.error('Comparison chart canvas not found');
        return;
    }
    
    comparisonChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Resilience', 'PDR', 'Active Nodes', 'Redundancy Efficiency'],
            datasets: [
                {
                    label: 'Adaptive',
                    data: [0.400, 0.792, 12, 1.36],
                    backgroundColor: '#1FB8CD',
                    borderColor: '#1FB8CD',
                    borderWidth: 1
                },
                {
                    label: 'Baseline',
                    data: [0.600, 0.676, 18, 0],
                    backgroundColor: '#B4413C',
                    borderColor: '#B4413C',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 20
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    console.log('Comparison chart created');
}

// Populate cluster statistics
function populateClusterStats() {
    console.log('Populating cluster stats...');
    const container = document.getElementById('clusterStats');
    if (!container) {
        console.error('Cluster stats container not found');
        return;
    }
    
    container.innerHTML = ''; // Clear existing content
    
    simulationData.cluster_stats.forEach(cluster => {
        const clusterDiv = document.createElement('div');
        clusterDiv.className = `cluster-item cluster-${cluster.cluster_id}`;
        clusterDiv.innerHTML = `
            <h5>Cluster ${cluster.cluster_id}</h5>
            <p><strong>Nodes:</strong> ${cluster.nodes}</p>
            <p><strong>Avg Bandwidth:</strong> ${cluster.avg_bandwidth.toFixed(1)}</p>
            <p><strong>Avg PDR:</strong> ${cluster.avg_pdr.toFixed(3)}</p>
        `;
        container.appendChild(clusterDiv);
    });
    console.log('Cluster stats populated');
}

// Initialize controls
function initializeControls() {
    console.log('Initializing controls...');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const timeSlider = document.getElementById('timeSlider');
    const timeDisplay = document.getElementById('timeDisplay');
    const exportBtn = document.getElementById('exportBtn');

    if (!playPauseBtn || !timeSlider || !timeDisplay || !exportBtn) {
        console.error('Some control elements not found');
        return;
    }

    // Play/Pause functionality
    playPauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Play/Pause clicked, current state:', isPlaying);
        isPlaying = !isPlaying;
        playPauseBtn.textContent = isPlaying ? '⏸️ Pause' : '▶️ Play';
        
        if (isPlaying) {
            startAnimation();
        } else {
            if (animationTimeout) {
                clearTimeout(animationTimeout);
                animationTimeout = null;
            }
        }
        console.log('New playing state:', isPlaying);
    });

    // Time slider
    timeSlider.addEventListener('input', (e) => {
        currentStep = parseInt(e.target.value);
        timeDisplay.textContent = `Step ${currentStep}`;
        updateSimulationState(currentStep);
        console.log('Time slider changed to step:', currentStep);
    });

    // Export functionality
    exportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        exportSimulationData();
        console.log('Export clicked');
    });
    
    // Initialize display
    updateSimulationState(0);
    console.log('Controls initialized');
}

// Animation control
function startAnimation() {
    if (!isPlaying) return;
    
    const timeSlider = document.getElementById('timeSlider');
    const timeDisplay = document.getElementById('timeDisplay');
    
    currentStep++;
    if (currentStep > 49) {
        currentStep = 0;
    }
    
    if (timeSlider && timeDisplay) {
        timeSlider.value = currentStep;
        timeDisplay.textContent = `Step ${currentStep}`;
        updateSimulationState(currentStep);
    }
    
    animationTimeout = setTimeout(() => {
        if (isPlaying) startAnimation();
    }, 300);
}

// Update simulation state
function updateSimulationState(step) {
    // Find the closest performance data point
    let perfData = simulationData.performance_data[0];
    for (let i = 0; i < simulationData.performance_data.length; i++) {
        if (simulationData.performance_data[i].step <= step) {
            perfData = simulationData.performance_data[i];
        } else {
            break;
        }
    }
    
    if (perfData) {
        const avgPDR = document.getElementById('avgPDR');
        const resilience = document.getElementById('resilience');
        
        if (avgPDR) avgPDR.textContent = perfData.adaptive_pdr.toFixed(3);
        if (resilience) resilience.textContent = perfData.adaptive_resilience.toFixed(3);
    }
    
    // Update active nodes display based on churn
    const baseNodes = simulationData.final_nodes.length;
    const churnEffect = Math.floor(step * simulationData.network_config.churn_rate * baseNodes);
    const activeNodes = Math.max(baseNodes - churnEffect, simulationData.final_metrics.active_nodes_adaptive);
    const activeNodesEl = document.getElementById('activeNodes');
    if (activeNodesEl) activeNodesEl.textContent = activeNodes;
}

// Export functionality
function exportSimulationData() {
    const exportData = {
        timestamp: new Date().toISOString(),
        simulation_config: simulationData.network_config,
        performance_results: simulationData.performance_data,
        cluster_analysis: simulationData.cluster_stats,
        final_metrics: simulationData.final_metrics,
        active_nodes: simulationData.final_nodes
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `rlnc-simulation-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    console.log('Export completed');
}

// Responsive handling
window.addEventListener('resize', () => {
    if (networkSvg) {
        const container = document.getElementById('networkGraph');
        if (container) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            networkSvg.attr('width', width).attr('height', height);
            
            if (simulation) {
                simulation.force('center', d3.forceCenter(width / 2, height / 2));
                simulation.alpha(0.3).restart();
            }
        }
    }
    
    if (performanceChart) performanceChart.resize();
    if (comparisonChart) comparisonChart.resize();
});