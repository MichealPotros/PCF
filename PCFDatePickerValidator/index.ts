import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class PCFDatePickerValidator implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private context: ComponentFramework.Context<IInputs>;
    private container: HTMLDivElement;
    private baseDate: string;
    private dateFormat: string;
    private currentYear: number;
    private daySelectValues: Array<string>;
    private monthSelectValues: any;
    private yearSelectValues: Array<string>;
    private futureYearsCount: number;
    private _notifyOutputChanged: () => void;
    private monthSelectElement: HTMLSelectElement;
	private daySelectElement: HTMLSelectElement;
    private yearSelectElement: HTMLSelectElement;
    private divParentElement: HTMLDivElement;
    private selectedDay: string;

	constructor() {

    }
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this.context = context;
		this.container = container;
		this.baseDate = context.parameters.Field.raw && context.parameters.Field.raw.length ? context.parameters.Field.raw : "";
		//this.dateFormat = context.parameters.DateFormat.raw && context.parameters.DateFormat.raw.length ? context.parameters.DateFormat.raw : "";
		this.currentYear = new Date().getFullYear();
        this.futureYearsCount = 30;
		this._notifyOutputChanged = notifyOutputChanged;

		this.daySelectValues = ["Select day"];
		this.daySelectElement = document.createElement("select");
		this.daySelectElement.classList.add("dnl-second-select"); 
		this.divParentElement = document.createElement('div');
        this.divParentElement.classList.add("container");
        this.divParentElement.appendChild(this.daySelectElement);
		this.InitDayDropdown();
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
		this.InitDayDropdown();
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
		this.monthSelectElement.selectedIndex = 0;
		this.monthSelectElement.addEventListener("change", this.firstChange.bind(this));
	}

	private InitDayDropdown() {
		this.daySelectValues = ["Select day"];
		this.daySelectElement.add(new Option(this.daySelectValues[0]));
		this.daySelectElement.selectedIndex = 0;
		this.daySelectElement.addEventListener("change", this.dayChange.bind(this));
	}

	private dayChange(){
		this.selectedDay = this.daySelectElement[this.daySelectElement.selectedIndex].innerText;
		this._notifyOutputChanged();
	}

	private firstChange() {
		this.daySelectValues = ["Select day", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
		let currentMonth = this.monthSelectElement.selectedIndex;
		let currentYear = this.yearSelectElement[this.yearSelectElement.selectedIndex].innerText
		let daysInMonth = this.getDaysInMonth(currentMonth, parseInt(currentYear));
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
		return {Field: `${this.daySelectElement[this.daySelectElement.selectedIndex].innerText}-${this.monthSelectElement[this.monthSelectElement.selectedIndex].innerText}-${this.yearSelectElement[this.yearSelectElement.selectedIndex].innerText}`};
	}

	public destroy(): void
	{}
}