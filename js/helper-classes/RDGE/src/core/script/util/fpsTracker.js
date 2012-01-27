/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

fpsTracker = function (id) {
    this.id = id;
    this.fpsRaw = new stat(id + "_fps", "raw", 0, null, false);
    this.fpsAvg = new stat(id + "_fps", "avg", 0, null, false);
    this.fpsMin = new stat(id + "_fps", "min", 0, null, false);
    this.fpsMax = new stat(id + "_fps", "max", 0, null, false);
    this.samples = [];
    this.maxSamples = 10;
    this.timeStampMS = 0.0;
    this.reportInterval = 500;
    
    this.close = function() {
        stat.pages[id + "_fps"] = null;
    }

    this.sample = function() {
        var currMS = new Date().getTime();
        this.samples.push(currMS - this.timeStampMS);
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }
        this.timeStampMS = currMS;
        var accum = 0.0;
        var fmin = -1e10;
        var fmax = 1e10;
        var i = this.samples.length - 1;
        while (i >= 0) {
            accum += this.samples[i];
            fmin = Math.max(fmin, this.samples[i]);
            fmax = Math.min(fmax, this.samples[i]);
            i--;
        }
        var denom = this.samples.length > 0 ? accum / this.samples.length : 0;
        var avgFPS = denom > 0 ? 1000 / denom : 0;
        var minFPS = fmin > 0 ? 1000 / fmin : 0;
        var maxFPS = fmax > 0 ? 1000 / fmax : 0;
        var lastSample = this.samples[this.samples.length - 1];
        var rawFPS = (lastSample > 0) ? 1000 / lastSample : 0;

        this.fpsRaw.value = rawFPS.toFixed(2);
        this.fpsAvg.value = avgFPS.toFixed(2);
        this.fpsMin.value = minFPS.toFixed(2);
        this.fpsMax.value = maxFPS.toFixed(2);
    }
}   