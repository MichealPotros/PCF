import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class PCFDatePickerValidator implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private context: ComponentFramework.Context<IInputs>;
    private container: HTMLDivElement;
    private monthDropdown: HTMLSelectElement;
    private daysDropdown: HTMLSelectElement;
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
    private monthSelectElement: HTMLSelectElement;
	private daySelectElement: HTMLSelectElement;
    private yearSelectElement: HTMLSelectElement;
    private divParentElement: HTMLDivElement;
    
	constructor() {

    }
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this.context = context;
		this.container = container;
		this.baseDate = context.parameters.Field.raw && context.parameters.Field.raw.length ? context.parameters.Field.raw : "";
		this.dateFormat = context.parameters.DateFormat.raw && context.parameters.DateFormat.raw.length ? context.parameters.DateFormat.raw : "";
		this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth()+1;
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

		this.daySelectValues = ["Select day"];
		this.daySelectElement = document.createElement("select");
		this.daySelectElement.classList.add("dnl-second-select");
		//this.container.append(this.daySelectElement);
		this.divParentElement = document.createElement('div');
        this.divParentElement.classList.add("container");
        this.divParentElement.appendChild(this.daySelectElement);

		this.InitDayDropdown(false,this.daySelectValues);

		this.monthSelectValues = {"Select month" :"0"};
		let yearStart =  this.currentYear - 120;
        let yearEnd =  this.currentYear +  this.futureYearsCount;
        let yearsArr = new Array<string>();
        let yearTemp = yearStart;
        
		yearsArr.push("Select year");
        while(yearStart < yearEnd+1){
            yearTemp = yearStart++;
            yearsArr.push(yearTemp.toString());
        }
        
        this.yearSelectValues= yearsArr.slice();

		this.InitMonthDropdown(false);
		this.InityearSelectElement();
		this.container.append(this.divParentElement);
	}

	private InityearSelectElement() {
        let context = this;
        this.yearSelectElement = document.createElement("select");
        this.yearSelectElement.classList.add("dnl-third");
        this.yearSelectElement.classList.add("dnl-first-select");

        this.yearSelectValues.forEach(function (el) {
            context.yearSelectElement.add(new Option(el));
        });
         
        //to fix the days count for non-leap/ leap years
        this.yearSelectElement.addEventListener("change", this.onYearChange.bind(this));
        this.yearSelectElement.selectedIndex = 0; 
        this.divParentElement.appendChild(this.yearSelectElement);
		//this.container.append(this.yearSelectElement);
    }

	private onYearChange(){
		//reset the days dropdown
		this.daySelectValues = ["Select day"];
		this.clearDaysAllOptions();
		this.InitDayDropdown(false,this.daySelectValues);
		//initiate the month dropdown
		this.clearMonthsAllOptions();
		this.InitMonthDropdown(true);
	}

	private InitMonthDropdown(isFromYear: boolean) {
		let context = this;
		if(isFromYear){
		this.monthSelectValues = {"Select month": "0", "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"};
		}
		else{
		this.monthSelectElement = document.createElement("select");
		this.monthSelectElement.classList.add("dnl-first-select");
		//this.container.append(this.monthSelectElement);
        this.divParentElement.appendChild(this.monthSelectElement);

		}
		Object.keys(this.monthSelectValues).forEach(function (el) {
			context.monthSelectElement.add(new Option(el));
		});
		// let monthName = Object.keys(this.monthSelectValues).find(el => this.monthSelectValues[el] == this.firstValue) as string;
		// this.monthSelectElement.selectedIndex = this.firstValue ? Object.keys(this.monthSelectValues).indexOf(monthName) : 0;
		this.monthSelectElement.selectedIndex = 0;
		this.monthSelectElement.addEventListener("change", this.firstChange.bind(this));
	}

	private InitDayDropdown(isFromMonth: boolean,daySelectValues: Array<string>) {
		let daysInMonth = 0;
		let currentMonth = this.firstValue && this.firstValue[0] == "0" && this.firstValue.length > 1 ? this.firstValue.substring(1) : this.firstValue == "---" || !this.firstValue ? "1" : this.firstValue;
		let currentYear = new Date().getFullYear();

		if(isFromMonth){
			daysInMonth = this.getDaysInMonth(parseInt(currentMonth, 10), currentYear);
		}
		for (let i = 0; i <= daysInMonth; i++) {
			this.daySelectElement.add(new Option(daySelectValues[i]));
		}
		//this.daySelectElement.selectedIndex = this.secondValue ? this.daySelectValues.indexOf(this.secondValue) : 0;
		this.daySelectElement.selectedIndex = 0;
		
	}

	private firstChange() {
		this.daySelectValues = ["Select day", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
		this.InitDayDropdown(true,this.daySelectValues);

		let currentMonth = this.monthSelectElement.selectedIndex;
		let currentYear = this.yearSelectElement[this.yearSelectElement.selectedIndex].innerText
		let daysInMonth = this.getDaysInMonth(currentMonth, parseInt(currentYear));
		let daysArray = this.daySelectValues.filter(el => { return el !== "---" && parseInt(el, 10) <= daysInMonth });
		this.clearDaysAllOptions();
		for (let i = 0; i <= daysInMonth; i++) {
			this.daySelectElement.add(new Option(this.daySelectValues[i]));
		}
	this.daySelectElement.selectedIndex= 0;
		this._notifyOutputChanged();
	}
 
	private getDaysInMonth(month: number, year: number) {
		return new Date(year, month, 0).getDate();
	}

	private clearDaysAllOptions() {
		let i = 0;
		let selectLength = this.daySelectElement.options.length - 1;
		for (i = selectLength; i >= 0; i--) {
			this.daySelectElement.remove(i);
		}
	}

	private clearMonthsAllOptions() {
		let i = 0;
		let selectLength = this.monthSelectElement.options.length - 1;
		for (i = selectLength; i >= 0; i--) {
			this.monthSelectElement.remove(i);
		}
	}

	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this.baseDate = context.parameters.Field.raw ? context.parameters.Field.raw : "";
	}

	public getOutputs(): IOutputs
	{
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

	public destroy(): void
	{}
}