<script>
    import {Line} from 'svelte-chartjs';

    import {
        CategoryScale,
        Chart as ChartJS,
        Legend,
        LinearScale,
        LineElement,
        PointElement,
        Title,
        Tooltip,
    } from 'chart.js';

    ChartJS.register(
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        PointElement,
        CategoryScale
    );

    export let data;

    $: values = data.datasets[0].data;

    function median(array) {
        const len = array.length;
        if (len === 0) {
            throw new Error('Cannot calculate median of an empty array.');
        }
        const tmp = [...array]

        tmp.sort((a, b) => a - b);

        if (len % 2) {
            return tmp[(len - 1) / 2];
        } else {
            const mid = len / 2;
            return (tmp[mid - 1] + tmp[mid]) / 2;
        }
    }
</script>

<Line {data} options={{ responsive: true }} />

<div class="flex flex-row justify-end mt-2">
    <div class="w-24 text-xs text-gray-600">
        <div>最小</div>
        <div>{Math.min(...values).toLocaleString()}</div>
    </div>
    <div class="w-24 text-xs text-gray-600">
        <div>最大</div>
        <div>{Math.max(...values).toLocaleString()}</div>
    </div>
    <div class="w-24 text-xs text-gray-600">
        <div>平均</div>
        <div>{Math.round(values.reduce((total, value) => total + value, 0) / values.length).toLocaleString()}</div>
    </div>
    <div class="w-24 text-xs text-gray-600">
        <div>中央</div>
        <div>{median(values).toLocaleString()}</div>
    </div>
</div>
