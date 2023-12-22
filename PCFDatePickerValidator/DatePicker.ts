import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as JsonData from './languages/PCFDataPicker_languages.json';

export class PCFDatePickerValidator implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private context: ComponentFramework.Context<IInputs>;
    private container: HTMLDivElement;
    private dateFormat: Date | null;
    private currentYear: number; 
    private yearSelectValues: Array<string>;
    private futureYearsCount: number;
    private _notifyOutputChanged: () => void;
    private monthSelectElement: HTMLSelectElement;
	private daySelectElement: HTMLSelectElement;
    private yearSelectElement: HTMLSelectElement;
    private divParentElement: HTMLDivElement; 
	private dayObject:  any;
	private yearObject:  any;
	private monthObject:  [string, string][]; 
	private jsonData: any[];
	private userLanguage: string;

	constructor() {
    }

	//Handles the languages
	private readIsLTRDirection(languageCode: string): boolean {
		const dayObject = this.jsonData.find(item => item.language === languageCode)?.ltr;
		return dayObject;
	}

	private readDayObject(languageCode: string): string[] | undefined {
		const dayObject = this.jsonData.find(item => item.language === languageCode)?.days;
		return dayObject;
	}

	private readMonthObject(languageCode: string): { [key: string]: string } | undefined {
		const monthObject = this.jsonData.find(item => item.language === languageCode)?.months;
		return monthObject;
	}

	private readYearObject(languageCode: string): string[] | undefined {
		const yearObject = this.jsonData.find(item => item.language === languageCode)?.years;
		return yearObject;
	}

	private findForeignDayItem(languageCode: string,dayValue: string): string | undefined {
		const foreignDayObject = this.jsonData.find(item => item.language === languageCode)?.days;
		const engDayObject = this.jsonData.find(item => item.language === "1033")?.days;
		let dayIndex =0;
		for (let i = 0; i < engDayObject.length; i++){
			if(engDayObject[i] === dayValue){
				dayIndex = i;
				continue;
			}
		}
		return foreignDayObject[dayIndex];
	}

	private findEnDayItem(languageCode: string,dayValue: string): string {
		const foreignDayObject = this.jsonData.find(item => item.language === languageCode)?.days;
		const engDayObject = this.jsonData.find(item => item.language === "1033")?.days;
		let dayIndex =0;
		for (let i = 0; i < foreignDayObject.length; i++){
			if(foreignDayObject[i] === dayValue){
				dayIndex = i;
				continue;
			}
		}
		return engDayObject[dayIndex];
	}

	private findForeignYearItem(languageCode: string, yearValue:string): string {
		const foreignYearObject = this.jsonData.find(item => item.language === languageCode)?.years;
		const enYearObject = this.jsonData.find(item => item.language === "1033")?.years;
		let yearIndex =0;
		for (let i = 0; i < enYearObject.length; i++){
			if(enYearObject[i] === yearValue){
				yearIndex = i;
				continue;
			}
		}
		return foreignYearObject[yearIndex];
	}

	private findEnYearItem(languageCode: string, yearValue:string): string {
		const foreignYearObject = this.jsonData.find(item => item.language === languageCode)?.years;
		const enYearObject = this.jsonData.find(item => item.language === "1033")?.years;
		let yearIndex =0;
		for (let i = 0; i < foreignYearObject.length; i++){
			if(foreignYearObject[i] === yearValue){
				yearIndex = i;
				continue;
			}
		}
		return enYearObject[yearIndex];
	}
	private retrieveDataFromDataverse(recordId: string): void {
        // Use Web API to retrieve data
        const entityLogicalName = "incident"; // Replace with your entity logical name (e.g., "incident" for Case)
        const fieldsToSelect = ["title"]; // Replace with the fields you want to retrieve

        this.context.webAPI.retrieveRecord(entityLogicalName, recordId, `?$select=${fieldsToSelect.join(",")}`)
            .then((result) => {
                // Process the retrieved data
                console.log(result);

                // Access the "Title" field value
                const caseTitle = result.title; // Adjust this based on the actual logical name of the "Title" field
                console.log(`Case Title: ${caseTitle}`);

                // Now you can use the retrieved data as needed
            })
            .catch((error) => {
                console.error(error);

                // Handle errors appropriately
            });
    }

	private sortObjectByValues(obj: {[key: string]: string}):  [string, string][] {
		// Convert the object to an array of key-value pairs
		const keyValueArray: [string, string][] = Object.entries(obj);
		// Sort the array based on the string values
		keyValueArray.sort((a, b) => a[1].localeCompare(b[1]));
		return keyValueArray;
	}
		
	///////////////

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{ 
        this.context = context;
		this.container = container;
		this.dateFormat = context.parameters.DateControl.raw? context.parameters.DateControl.raw:null;
		this._notifyOutputChanged = notifyOutputChanged;

		this.jsonData= JsonData ;
		this.userLanguage = this.context.userSettings.languageId.toString();
		this.monthObject = this.sortObjectByValues(this.readMonthObject(this.userLanguage) as {[key: string]: string});
		this.dayObject = this.readDayObject(this.userLanguage);
		this.yearObject = this.readYearObject(this.userLanguage);
		let isLRTDirection = this.readIsLTRDirection(this.userLanguage);

		this.currentYear = new Date().getFullYear();
        this.futureYearsCount = 30;
		let yearStart =  this.currentYear - 120;
        let yearEnd =  this.currentYear +  this.futureYearsCount;
		
        this.yearSelectValues= this.yearObject.slice();

		//Build the three selects HTML 
		this.divParentElement = document.createElement('div');
        this.divParentElement.classList.add("container");
		if(isLRTDirection){
			this.buildDayElement();
			this.InitDayDropdown(false);
			this.InitMonthDropdown(false);
			this.InityearSelectElement();
		}else{
			this.InityearSelectElement();
			this.InitMonthDropdown(false);
			this.buildDayElement();
			this.InitDayDropdown(false);
		}
		this.container.append(this.divParentElement);
	}

	private InityearSelectElement() {
        let context = this;
		let currentYearIndex = 0;
		let currentYearCounter = -1;
		let localDateFormate = this.dateFormat;
        this.yearSelectElement = document.createElement("select");
        this.yearSelectElement.classList.add("dnl-third");
        this.yearSelectElement.classList.add("dnl-first-select");

        this.yearSelectValues.forEach(function (el) {
			currentYearCounter++;
            context.yearSelectElement.add(new Option(el));
			if(localDateFormate != null && context.findForeignYearItem(context.userLanguage,localDateFormate.getFullYear().toString()) === el){
				currentYearIndex = currentYearCounter;
			}
        });

        //to fix the days count for non-leap/ leap years
        this.yearSelectElement.addEventListener("change", this.onYearChange.bind(this));
        this.yearSelectElement.selectedIndex = currentYearIndex;
        this.divParentElement.appendChild(this.yearSelectElement); 
    }

	private onYearChange(){
		//reset the days dropdown
		this.clearDaysAllOptions();
		this.InitDayDropdown(true);
		//initiate the month dropdown
		this.clearMonthsAllOptions();
		this.InitMonthDropdown(true);
		this._notifyOutputChanged();
	}

	private InitMonthDropdown(isFromYear: boolean) {
		let context = this;
		let currentMonthIndex = 0;
		let currentMonthcounter = -1;
		
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

			if(this.dateFormat != null){
				for (const entry of this.monthObject) {
					currentMonthcounter++;
					const key = entry[0];
					const value = entry[1];
					context.monthSelectElement.add(new Option(key));
					if((this.dateFormat.getMonth()+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) === value){
						currentMonthIndex = currentMonthcounter;
					}
				}
			}else{
				context.monthSelectElement.add(new Option(this.monthObject[0][0]));
			}
		}
		this.monthSelectElement.selectedIndex = currentMonthIndex;
		this.monthSelectElement.addEventListener("change", this.firstChange.bind(this));
	}

	private buildDayElement(){
		this.daySelectElement = document.createElement("select");
		this.daySelectElement.classList.add("dnl-second-select");
		
        this.divParentElement.appendChild(this.daySelectElement);
	}
	private InitDayDropdown(isYear:boolean) {
		if(isYear){ 
			this.daySelectElement.add(new Option(this.dayObject[0]));
			this.daySelectElement.selectedIndex = 0;
		}else if(this.dateFormat != null){
			let currentMonth = this.dateFormat.getMonth()+1;
			let currentYear = this.dateFormat.getFullYear();
			let daysInMonth = this.getDaysInMonth(currentMonth, currentYear);
			this.clearDaysAllOptions();
			let currentDayIndex = 0;
			for (let i = 0; i <= daysInMonth; i++) {
				this.daySelectElement.add(new Option(this.dayObject[i]));
				if(this.dayObject[i] === this.findForeignDayItem(this.userLanguage,this.dateFormat.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}))){
					currentDayIndex = i;
				}	
			}
			this.daySelectElement.selectedIndex= currentDayIndex;
		}
		this.daySelectElement.addEventListener("change", this.dayChange.bind(this));
	}

	private dayChange(){
		this._notifyOutputChanged();
	}

	private firstChange() {
		let currentMonth = this.monthSelectElement.selectedIndex;
		let currentYear = this.yearSelectElement[this.yearSelectElement.selectedIndex].innerText
		let yearValue= 0;
		if(this.userLanguage !== "1033"){
			yearValue = parseInt(this.findEnYearItem(this.userLanguage, currentYear));
			
		}else{
			yearValue= parseInt(currentYear);
		}
		let daysInMonth = this.getDaysInMonth(currentMonth, yearValue);
		this.clearDaysAllOptions();
		for (let i = 0; i <= daysInMonth; i++) {
			this.daySelectElement.add(new Option(this.dayObject[i]));
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
		let currentDay = this.daySelectElement[this.daySelectElement.selectedIndex].innerText
		let currentYear = this.yearSelectElement[this.yearSelectElement.selectedIndex].innerText
		let dayValue= "";
		let yearValue= "0";
		if(this.userLanguage !== "1033"){
			yearValue = this.findEnYearItem(this.userLanguage, currentYear);
			dayValue = this.findEnDayItem(this.userLanguage, currentDay);
			
		}else{
			dayValue= currentDay;
			yearValue= currentYear;
		}

		return {DateControl: new Date(`${yearValue}`+`-${this.monthSelectElement.selectedIndex}`+`-${dayValue}`)};
	}

	public destroy(): void
	{}
}