import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { cloneArray } from "../core/utils";
import { DataUtil } from "../data-operations/data-util";
import { IFilteringExpression } from "../data-operations/filtering-expression.interface";
import { ISortingExpression, SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { IgxGridComponent } from "./grid.component";
import { IgxGridRowComponent } from "./row.component";

@Injectable()
export class IgxGridAPIService {

    public change: Subject<any> = new Subject<any>();
    protected state: Map<string, IgxGridComponent> = new Map<string, IgxGridComponent>();

    public register(grid: IgxGridComponent) {
        this.state.set(grid.id, grid);
    }

    public get(id: string): IgxGridComponent {
        return this.state.get(id);
    }

    public get_column_by_name(id: string, name: string): IgxColumnComponent {
        return this.get(id).columnList.find((col) => col.field === name);
    }

    public get_row(id: string, index: number): IgxGridRowComponent {
        return this.get(id).rowList.find((row) => row.index === index);
    }

    public get_cell_by_field(id: string, rowIndex: number, field: string): IgxGridCellComponent {
        const row = this.get_row(id, rowIndex);
        if (row) {
            return row.cells.find((cell) => cell.column.field === field);
        }
    }

    public notify(id: string) {
        this.get(id).eventBus.next(true);
    }

    public get_cell_by_index(id: string, rowIndex: number, columnIndex: number): IgxGridCellComponent {
        const row = this.get_row(id, rowIndex);
        if (row) {
            return row.cells.find((cell) => cell.columnIndex === columnIndex);
        }
    }

    public update(id: string, cell: IgxGridCellComponent): void {
        const index = this.get(id).data.indexOf(cell.row.rowData);
        this.get(id).data[index][cell.column.field] = cell.value;
    }

    public update_row(value: any, id: string, row: IgxGridRowComponent): void {
        const index = this.get(id).data.indexOf(row.rowData);
        this.get(id).onEditDone.emit({ currentValue: this.get(id).data[index], newValue: value });
        this.get(id).data[index] = value;
    }

    public sort(id: string, fieldName: string, dir: SortingDirection, ignoreCase: boolean): void {
        const sortingState = this.get(id).sortingExpressions;

        this.prepare_sorting_expression(sortingState, fieldName, dir, ignoreCase);
        this.get(id).sortingExpressions = sortingState;
    }

    public sort_multiple(id: string, expressions: ISortingExpression[]): void {
        const sortingState = this.get(id).sortingExpressions;

        for (const each of expressions) {
            this.prepare_sorting_expression(sortingState, each.fieldName, each.dir, each.ignoreCase);
        }

        this.get(id).sortingExpressions = sortingState;
    }

    public filter(id, fieldName, term, condition, ignoreCase) {
        const filteringState = this.get(id).filteringExpressions;
        if (this.get(id).paging) {
            this.get(id).page = 0;
        }
        this.prepare_filtering_expression(filteringState, fieldName, term, condition, ignoreCase);
        this.get(id).filteringExpressions = filteringState;
    }

    public filter_multiple(id: string, expressions: IFilteringExpression[]) {
        const filteringState = this.get(id).filteringExpressions;
        if (this.get(id).paging) {
            this.get(id).page = 0;
        }

        for (const each of expressions) {
            this.prepare_filtering_expression(filteringState, each.fieldName,
                                              each.searchVal, each.condition, each.ignoreCase);
        }
        this.get(id).filteringExpressions = filteringState;
    }

    public filter_global(id, term, condition, ignoreCase) {
        const filteringState = this.get(id).filteringExpressions;
        if (this.get(id).paging) {
            this.get(id).page = 0;
        }

        for (const column of this.get(id).columns) {
            this.prepare_filtering_expression(filteringState, column.field, term,
                condition || column.filteringCondition, ignoreCase || column.filteringIgnoreCase);
        }
        this.get(id).filteringExpressions = filteringState;
    }

    public clear_filter(id, fieldName) {
        const filteringState = this.get(id).filteringExpressions;
        const index = filteringState.findIndex((expr) => expr.fieldName === fieldName);
        if (index > -1) {
            filteringState.splice(index, 1);
            this.get(id).filteringExpressions = filteringState;
        }
    }

    public clear_sort(id, fieldName) {
        const sortingState = this.get(id).sortingExpressions;
        const index = sortingState.findIndex((expr) => expr.fieldName === fieldName);
        if (index > -1) {
            sortingState.splice(index, 1);
            this.get(id).sortingExpressions = sortingState;
        }
    }
    public min(id, fieldName): number {
        let minValue;
        minValue = this.get(id).data.map((x) => x[fieldName]).reduce((a, b) => Math.min(a, b));
        return minValue;
    }

    public max(id, fieldName): number {
        let maxValue;
        maxValue = this.get(id).data.map((x) => x[fieldName]).reduce((a, b) => Math.max(a, b));
        return maxValue;
    }

    public average(id, fieldName): number {
        let average;
        average = this.sum(id, fieldName) / this.count(id, fieldName);
        return average;
    }

    public sum(id, fieldName): number {
        let sumValue;
        sumValue = this.get(id).data.map((x) => x[fieldName]).reduce((a, b) =>  a + b);
        return sumValue;
    }

    public count(id, fieldName): number {
        let count;
        count = this.get(id).data.map((x) => x[fieldName]).length;
        return count;
    }
    public earliestDate(id, fieldName) {
    }

    protected prepare_filtering_expression(state, fieldName, searchVal, condition, ignoreCase) {

        const expression = state.find((expr) => expr.fieldName === fieldName);
        const newExpression = { fieldName, searchVal, condition, ignoreCase };
        if (!expression) {
            state.push(newExpression);
        } else {
            Object.assign(expression, newExpression);
        }
    }

    protected prepare_sorting_expression(state, fieldName, dir, ignoreCase) {

        if (dir === SortingDirection.None) {
            state.splice(state.findIndex((expr) => expr.fieldName === fieldName), 1);
            return;
        }

        const expression = state.find((expr) => expr.fieldName === fieldName);

        if (!expression) {
            state.push({ fieldName, dir, ignoreCase });
        } else {
            Object.assign(expression, { fieldName, dir, ignoreCase });
        }
    }
}
