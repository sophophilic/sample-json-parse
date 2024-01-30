import { Component, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [
	  CommonModule
  ],
  templateUrl: './test-component.component.html',
  styleUrl: './test-component.component.scss'
})
export class TestComponent implements OnInit {
	message = {
		"_type": "EA", // --> Ignore
		"ALC SO ID:": {
			"#": "90472335,90472335,90571214,90571214,93931420,95240998,95291524,95321172",
			"Contract End Date": "2024-10-22"
		}, // --> Simple Object --> comma separated with key:value structure
		"EA Sub ID/WO ID:": {"#": "90167936", "Contract End Date": "2024-09-21"}, // --> Simple Object --> comma separated with key:value structure
		"summary": [
			{"PMG": "CISE", "ALC": 0.05, "EA": "N"},
			{"PMG": "DUO SECURITY", "ALC": 0.31, "EA": "N"},
			{"PMG": "FIREWALL", "ALC": 0.57, "EA": "Y"},
			{"PMG": "VIRTUAL PRIVATE NETWORK", "ALC": 0.07, "EA": "Y"}
		], // --> Array of objects --> should be created in a table format with unique keys as header and values as rows
		"Covered": 0.64, //--> print as string
		"Covered1": [0.64, 0.8, 0.95], //--> Simple array - comma separated with key:value structure,
		"TestBool": "Y", // --> bool value - show cross/tick based on value type
		"TestBool1": "N",
		"TestBool2": true,
		"TestBool3": false
	}

	objToRender: any[] = [];

	parseSimpleKeyValuePair(val: any, key: any) {
		return {
			type: 'simpleKeyValPair',
			key,
			value: val.toString()
		};
	}

	parseSimpleObject(val: any, key: any) {
		let str = '';
		for(let id in val) {
			str += `${id}:${val[id]}, `
		}
		str = str.substring(0, str.length-2); // -2 to remove last space and comma
		return {
			type: 'simpleObject',
			key: key.substring(0, key.length - 1),
			value: str
		};
	}

	parseBoolean(val: any, key: any) {
		let valToShow;
		if(typeof val === "boolean") {
			valToShow = val ? 'Y' : 'X'
		} else {
			valToShow = val.toLowerCase() === 'y' ? 'Y' : 'X';
		}
		return {
			type: 'boolVal',
			key,
			value: valToShow
		}
	}

	parseArrayOfObjects(val: any, key: any) {
		let arr = [];
		for(let i = 0; i < val.length; i++) {
			const obj = val[i];
			arr.push(...Object.keys(obj));
		}

		return {
			type: 'table',
			key,
			value: val,
			headers: Array.from(new Set(arr))
		}
	}

	parseFullMessage(msg: any): any[] {
		const result: any[] = [];
		for(let key in msg) {
			// Assuming key is string always else string check is required using typeof
			const val = msg[key];
			if(key.startsWith('_')) {
				// ignore - do nothing
			} else if(Object.prototype.toString.call(val) === '[object Object]') {
				result.push(this.parseSimpleObject(val, key));
			} else if(Array.isArray(val) && val.length > 0) {
				// Assuming it's a simple 1 level nested array with similar type
				if(Object.prototype.toString.call(val[0]) === '[object Object]') {
					result.push(this.parseArrayOfObjects(val, key));
				} else {
					result.push(this.parseSimpleKeyValuePair(val, key));
				}
			} else if(typeof val === "boolean" || (typeof val === "string" && (val.toLowerCase() === 'y' || val.toLowerCase() === 'n'))) {
				result.push(this.parseBoolean(val, key));
			} else {
				result.push(this.parseSimpleKeyValuePair(val, key));
			}
		}
		return result;
	}

	ngOnInit() {
		this.objToRender = this.parseFullMessage(this.message);
		console.log('Obj to Render - ', this.objToRender);
	}
}
