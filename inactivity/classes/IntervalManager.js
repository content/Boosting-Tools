export default class IntervalManager {
    static intervals = [];

    static add(interval, frequency) {
        const intervalId = setInterval(interval, frequency);
        IntervalManager.intervals.push(intervalId);
        
        return intervalId;
    }

    static remove(intervalId) {
        clearInterval(intervalId);
        IntervalManager.intervals = IntervalManager.intervals.filter(id => id !== intervalId);
    }
}