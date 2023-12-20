import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as monthJsonData from './languages/PCFDataPicker_languages.json';

export class PCFDatePickerValidator implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private context: ComponentFramework.Context<IInputs>;
    private container: HTMLDivElement; 
    private dateFormat: Date | null;
    private currentYear: number;
    private daySelectValues: Array<string>; 
    private yearSelectValues: Array<string>;
    private futureYearsCount: number;
    private _notifyOutputChanged: () => void;
    private monthSelectElement: HTMLSelectElement;
	private daySelectElement: HTMLSelectElement;
    private yearSelectElement: HTMLSelectElement;
    private divParentElement: HTMLDivElement;

	private monthObject:  [string, string][];
	private monthData: any[];


	constructor() {
    }

	//Handles the languages
	private readMonthObject(languageCode: string): { [key: string]: string } | undefined { 
		const monthObject = this.monthData.find(item => item.language === languageCode)?.months;
		return monthObject;
	}
	private sortObjectByValues(obj: {[key: string]: string}):  [string, string][] {
		// Convert the object to an array of key-value pairs
		const keyValueArray: [string, string][] = Object.entries(obj);
	
		// Sort the array based on the string values
		keyValueArray.sort((a, b) => a[1].localeCompare(b[1]));
	
		// Convert the sorted array back to an object
		const sortedObject: {[key: string]: string} = Object.fromEntries(keyValueArray);
	
		return keyValueArray;
	}

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{ 
		// this.monthObject = monthJsonData as { [key: string]: string };
		this.monthData= monthJsonData ;
		this.monthObject = this.sortObjectByValues(this.readMonthObject("1025") as {[key: string]: string});
		
		this.context = context;
		this.container = container; 
		this.dateFormat = context.parameters.DateControl.raw? context.parameters.DateControl.raw:null;
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
			for (const entry of this.monthObject) { 
				const key = entry[0];
				const value = entry[1];
				context.monthSelectElement.add(new Option(key));
			}
		}
		else{
			this.monthSelectElement = document.createElement("select");
			this.monthSelectElement.classList.add("dnl-first-select");
			this.divParentElement.appendChild(this.monthSelectElement);
			context.monthSelectElement.add(new Option(this.monthObject[0][0]));
		}
		
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
		//this.baseDate = context.parameters.DateControl.raw ? context.parameters.DateControl.raw : "";
	}

	public getOutputs(): IOutputs
	{
		if(this.daySelectElement.selectedIndex > 0 && this.monthSelectElement.selectedIndex> 0 && this.yearSelectElement.selectedIndex > 0){
			return {DateControl: new Date(parseInt(this.yearSelectElement[this.yearSelectElement.selectedIndex].innerText),this.monthSelectElement.selectedIndex,parseInt(this.daySelectElement[this.daySelectElement.selectedIndex].innerText))};
		}else{
			return {DateControl: new Date()};
		}
	}

	public destroy(): void
	{}
 
}