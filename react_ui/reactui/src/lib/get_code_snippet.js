import {JSDOM} from "jsdom"
import axios from "axios"
import md5 from "md5"

export function analyzeURL(url) {
	return new Promise(function(resolve, reject){
		let get_html_url = "http://localhost:3002/page_url?url=" + url
		axios({
			method: "GET",
			url: get_html_url
		}).then((response) => {
			let page_html = response["data"]["html_content"]
			let html_array = analyzeHTML(page_html)
			resolve(html_array)
		})
	})
}

const analyzeHTML = (html_content) => {
	let dom_result = new JSDOM(html_content)
	let page_document = dom_result.window.document;
	let page_body  = page_document.getElementsByTagName("body")[0]
	let search_tag_array = ["pre", "code", "textarea"];
	let html_array = []
	let md5_html_array = []
	search_tag_array.forEach(function(tag){
		let tag_array = page_body.getElementsByTagName(tag)
		let html_hash = ""; let tag_content = "";
		for(var i = 0; i < tag_array.length; i++){
			tag_content = tag_array[i].textContent
			html_hash = md5(tag_content)
			if (md5_html_array.includes(html_hash) === false){
				html_array.push(tag_content)
				md5_html_array.push(html_hash)
			}
		}
	})
	return html_array
}