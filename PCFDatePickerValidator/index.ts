import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class PCFDatePickerValidator implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private context: ComponentFramework.Context<IInputs>;
    private container: HTMLDivElement;
    private monthDropdown: HTMLSelectElement;
    private daysDropdown: HTMLSelectElement;
    private yearsDropdown: HTMLSelectElement;
    private baseDate: string;
    private dateFormat: string;
    private currentYear: number;
    private currentMonth: number;
    private today: number;
    private firstValue: string;
    private secondValue: string;
    private daySelectValues: Array<string>;
    private monthSelectValues: any;
    private yearSelectValues: Array<string>;
    private futureYearsCount: number;
    private _notifyOutputChanged: () => void;
   
    constructor() {

    }
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this.context = context;
        this.container = container;
        this.baseDate = context.parameters.Field.raw && context.parameters.Field.raw.length ? context.parameters.Field.raw : "";
        this.dateFormat = context.parameters.DateFormat.raw && context.parameters.DateFormat.raw.length ? context.parameters.DateFormat.raw : "";
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth();
        this.today = new Date().getDate();
        this.futureYearsCount = 30;

        switch (this.dateFormat) {
            case "0": //YYYY-MM
                this.firstValue = this.baseDate ? this.baseDate.split("-")[1] : "";
                this.secondValue = this.baseDate ? this.baseDate.split("-")[0] : "";
                break;
            case "1":  //MM/DD
                this.firstValue = this.baseDate ? this.baseDate.split("/")[0] : "";
                this.secondValue = this.baseDate ? this.baseDate.split("/")[1] : "";
                break;
        }

        this._notifyOutputChanged = notifyOutputChanged;

        this.daySelectValues = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
        //this.monthSelectValues = { "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12" };
        this.monthSelectValues = { "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun", "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec" };

        let yearStart =  this.currentYear - 120;
        let yearEnd =  this.currentYear +  this.futureYearsCount;
        let yearsArr = new Array<string>();
        let yearTemp = yearStart;
        
        while(yearStart < yearEnd+1){
            yearTemp = yearStart++;
            yearsArr.push(yearTemp.toString());
        }
        
        this.yearSelectValues= yearsArr.slice();
        
        this.InitdaysDropdown();
        this.InitmonthDropdown();
        this.InitYearsDropdown();
    }

    private InitYearsDropdown() {
        let context = this;
        this.yearsDropdown = document.createElement("select");
        this.yearsDropdown.classList.add("dnl-third");
        this.yearsDropdown.classList.add("select");

        this.yearSelectValues.forEach(function (el) {
            context.yearsDropdown.add(new Option(el));
        });
         
        this.yearsDropdown.selectedIndex = this.yearSelectValues.indexOf(this.currentYear.toString()); 
        this.container.append(this.yearsDropdown);

    }

    private InitmonthDropdown() {
        let context = this;
        let currentMonthStr = `0${this.currentMonth}`.slice(-2);
        this.monthDropdown = document.createElement("select");
        this.monthDropdown.classList.add("dnl-first");
        this.monthDropdown.classList.add("select");

        Object.keys(this.monthSelectValues).forEach(function (el) {
            context.monthDropdown.add(new Option(el));
        });
        // let monthName = Object.keys(this.monthSelectValues).find(el => this.monthSelectValues[el] == this.currentMonth) as string;
        let monthName = this.monthSelectValues[currentMonthStr];
        // this.monthDropdown.selectedIndex =  Object.keys(this.monthSelectValues).indexOf(monthName);
        this.monthDropdown.selectedIndex =  this.monthSelectValues[currentMonthStr].indexOf(monthName);
 
        this.monthDropdown.addEventListener("change", this.firstChange.bind(this));
        this.container.append(this.monthDropdown);

    }

    private InitdaysDropdown() {
        let context = this;
        this.daysDropdown = document.createElement("select");
        this.daysDropdown.classList.add("second");
        this.daysDropdown.classList.add("select");
        // let currentMonth: string; 
        let daysInMonth: number;
        let todayStr = `0${this.today}`.slice(-2);
        // currentMonth = this.firstValue && this.firstValue[0] == "0" && 
        // this.firstValue.length > 1 ? this.firstValue.substring(1) : this.firstValue == "---" || !this.firstValue ? "1" : this.firstValue;
         
        // daysInMonth = this.getDaysInMonth(parseInt(currentMonth, 10), this.currentYear);
        daysInMonth = this.getDaysInMonth(this.currentMonth, this.currentYear);
        for (let i = 0; i <= daysInMonth; i++) {
            context.daysDropdown.add(new Option(this.daySelectValues[i]));
        }

        this.daysDropdown.selectedIndex = this.daySelectValues.indexOf(todayStr);  
 
        this.daysDropdown.addEventListener("change", this.secondChange.bind(this));
        this.container.append(this.daysDropdown);
    }

    private firstChange() {
        this.firstValue = this.monthDropdown[this.monthDropdown.selectedIndex].innerText;
        this.firstValue = this.monthSelectValues[this.firstValue];
        let currentMonth: string;
        //let currentYear = new Date().getFullYear();
        let selectedYear = this.yearsDropdown[this.yearsDropdown.selectedIndex].innerText;
        let daysInMonth: number;
        let daysArray = new Array<string>();
  
        currentMonth = this.firstValue && this.firstValue[0] == "0" && this.firstValue.length > 1 ? this.firstValue.substring(1) : this.firstValue == "---" || !this.firstValue ? "1" : this.firstValue;
        daysInMonth = this.getDaysInMonth(parseInt(currentMonth, 10), Number(selectedYear));
        daysArray = this.daySelectValues.filter(el => { return el !== "---" && parseInt(el, 10) <= daysInMonth });
        this.clearAllOptions();
          for (let i = 0; i <= daysInMonth; i++) {
            this.daysDropdown.add(new Option(this.daySelectValues[i]));
        }
        if (this.secondValue && this.secondValue !== "0") {
            this.daysDropdown.selectedIndex = this.secondValue && daysArray.includes(this.secondValue) ? daysArray.indexOf(this.secondValue) + 1 : daysArray.length;
            this.secondChange();
        }
        this._notifyOutputChanged();
    }

    private secondChange() {
        this.secondValue = this.daysDropdown[this.daysDropdown.selectedIndex].innerText.replace("---", "0");
        this._notifyOutputChanged();
    }

    private getDaysInMonth(month: number, year: number) {
        return new Date(year, month, 0).getDate();
    }

    private clearAllOptions() {
        let i = 0;
        let selectLength = this.daysDropdown.options.length - 1;
        for (i = selectLength; i >= 0; i--) {
            this.daysDropdown.remove(i);
        }
    }
    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.baseDate = context.parameters.Field.raw ? context.parameters.Field.raw : "";
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        let format = "";
		switch (this.dateFormat) {
			case "0": //YYYY-MM
				format = `${this.secondValue}-${this.firstValue}`;
				break;
			case "1": //MM/DD
				format = `${this.firstValue}/${this.secondValue}`
		}
		return {
			Field: (!this.secondValue || this.secondValue === "0") && (!this.firstValue || this.firstValue === "0") ? undefined : format
		};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
