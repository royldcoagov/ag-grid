"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var chartDataModel_1 = require("./chartDataModel");
var palettes_1 = require("../../charts/chart/palettes");
var ChartController = /** @class */ (function (_super) {
    __extends(ChartController, _super);
    function ChartController(model, paletteName) {
        if (paletteName === void 0) { paletteName = 'borneo'; }
        var _this = _super.call(this) || this;
        _this.model = model;
        _this.getChartType = function () { return _this.model.getChartType(); };
        _this.isPivotChart = function () { return _this.model.isPivotChart(); };
        _this.chartPaletteName = paletteName;
        return _this;
    }
    ChartController.prototype.init = function () {
        var _this = this;
        this.setChartRange();
        this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_RANGE_SELECTION_CHANGED, function (event) {
            if (event.id && event.id === _this.model.getChartId()) {
                _this.updateForRangeChange();
            }
        });
        this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_MODEL_UPDATED, this.updateForDataChange.bind(this));
        this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_CELL_VALUE_CHANGED, this.updateForDataChange.bind(this));
    };
    ChartController.prototype.updateForGridChange = function () {
        if (this.model.isDetached()) {
            return;
        }
        this.model.updateCellRanges();
        this.setChartRange();
    };
    ChartController.prototype.updateForDataChange = function () {
        if (this.model.isDetached()) {
            return;
        }
        this.model.updateData();
        this.raiseChartUpdatedEvent();
    };
    ChartController.prototype.updateForRangeChange = function () {
        this.updateForGridChange();
        this.raiseChartRangeSelectionChangedEvent();
    };
    ChartController.prototype.updateForPanelChange = function (updatedCol) {
        this.model.updateCellRanges(updatedCol);
        this.setChartRange();
        this.raiseChartRangeSelectionChangedEvent();
    };
    ChartController.prototype.getChartModel = function () {
        return {
            chartId: this.model.getChartId(),
            chartType: this.model.getChartType(),
            chartPalette: this.getPaletteName(),
            chartOptions: this.chartProxy.getChartOptions(),
            cellRange: this.getCurrentCellRangeParams()
        };
    };
    ChartController.prototype.getPaletteName = function () {
        return this.chartPaletteName;
    };
    ChartController.prototype.getPalettes = function () {
        var customPalette = this.chartProxy.getCustomPalette();
        if (customPalette) {
            var map = new Map();
            map.set(undefined, customPalette);
            return map;
        }
        return palettes_1.palettes;
    };
    ChartController.prototype.setChartType = function (chartType) {
        this.model.setChartType(chartType);
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    };
    ChartController.prototype.setChartPaletteName = function (palette) {
        this.chartPaletteName = palette;
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    };
    ChartController.prototype.getColStateForMenu = function () {
        return { dimensionCols: this.model.getDimensionColState(), valueCols: this.model.getValueColState() };
    };
    ChartController.prototype.isDefaultCategorySelected = function () {
        var selectedDimension = this.model.getSelectedDimension().colId;
        return selectedDimension && selectedDimension === chartDataModel_1.ChartDataModel.DEFAULT_CATEGORY;
    };
    ChartController.prototype.setChartRange = function () {
        if (this.rangeController && !this.model.isSuppressChartRanges() && !this.model.isDetached()) {
            this.rangeController.setCellRanges(this.model.getCellRanges());
        }
        this.raiseChartUpdatedEvent();
    };
    ChartController.prototype.detachChartRange = function () {
        // when chart is detached it won't listen to changes from the grid
        this.model.toggleDetached();
        if (this.model.isDetached()) {
            // remove range from grid
            if (this.rangeController) {
                this.rangeController.setCellRanges([]);
            }
        }
        else {
            // update chart data may have changed
            this.updateForGridChange();
        }
    };
    ChartController.prototype.setChartProxy = function (chartProxy) {
        this.chartProxy = chartProxy;
    };
    ChartController.prototype.getChartProxy = function () {
        return this.chartProxy;
    };
    ChartController.prototype.isActiveXYChart = function () {
        return core_1._.includes([core_1.ChartType.Scatter, core_1.ChartType.Bubble], this.getChartType());
    };
    ChartController.prototype.getCurrentCellRangeParams = function () {
        var cellRanges = this.model.getCellRanges();
        var firstCellRange = cellRanges[0];
        return {
            rowStartIndex: firstCellRange.startRow && firstCellRange.startRow.rowIndex,
            rowStartPinned: firstCellRange.startRow && firstCellRange.startRow.rowPinned,
            rowEndIndex: firstCellRange.endRow && firstCellRange.endRow.rowIndex,
            rowEndPinned: firstCellRange.endRow && firstCellRange.endRow.rowPinned,
            columns: cellRanges.reduce(function (columns, value) { return columns.concat(value.columns.map(function (c) { return c.getId(); })); }, [])
        };
    };
    ChartController.prototype.raiseChartUpdatedEvent = function () {
        var event = Object.freeze({
            type: ChartController.EVENT_CHART_UPDATED
        });
        this.dispatchEvent(event);
    };
    ChartController.prototype.raiseChartOptionsChangedEvent = function () {
        var event = Object.freeze({
            type: core_1.Events.EVENT_CHART_OPTIONS_CHANGED,
            chartType: this.getChartType(),
            chartPalette: this.chartPaletteName,
            chartOptions: this.getChartProxy().getChartOptions(),
        });
        this.eventService.dispatchEvent(event);
    };
    ChartController.prototype.raiseChartRangeSelectionChangedEvent = function () {
        var event = Object.freeze({
            type: core_1.Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.getChartId(),
            cellRange: this.getCurrentCellRangeParams(),
            api: this.gridApi,
            columnApi: this.columnApi,
        });
        this.eventService.dispatchEvent(event);
    };
    ChartController.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.rangeController) {
            this.rangeController.setCellRanges([]);
        }
    };
    ChartController.EVENT_CHART_UPDATED = 'chartUpdated';
    __decorate([
        core_1.Autowired('eventService')
    ], ChartController.prototype, "eventService", void 0);
    __decorate([
        core_1.Autowired('rangeController')
    ], ChartController.prototype, "rangeController", void 0);
    __decorate([
        core_1.Autowired('gridApi')
    ], ChartController.prototype, "gridApi", void 0);
    __decorate([
        core_1.Autowired('columnApi')
    ], ChartController.prototype, "columnApi", void 0);
    __decorate([
        core_1.PostConstruct
    ], ChartController.prototype, "init", null);
    return ChartController;
}(core_1.BeanStub));
exports.ChartController = ChartController;
//# sourceMappingURL=chartController.js.map