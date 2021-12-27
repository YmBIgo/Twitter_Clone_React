import React, {useState} from "react"
import axios from "axios"
import {useDispatch, useSelector} from "react-redux"

import SearchModalPage1 from "./SearchModalPage1"
import {ChangeSearchModalPage} from "../../../actions"
import "../../CSS/Modal.css"
import {analyzeURL} from "../../../lib/get_code_snippet"

const SearchModal = () => {

	const dispatch = useDispatch()
	const searchPage = useSelector(state => state.searchPages)
	//
	const [keyword, setKeyword] = useState("")
	const [searchResult, setSearchResult] = useState([]);
	//
	const [page3SearchResultPos, setPage3SearchResultPos] = useState(0);
	const [page3SearchResult, setpage3SearchResult] = useState([]);
	//
	const [codeSnippets, setCodeSnippets] = useState([]);
	const [codeSnippetPos, setCodeSnippetPos] = useState(0);
	const [codeSnippets2, setCodeSnippets2] = useState([]);
	const [codeSnippetPos2, setCodeSnippetPos2] = useState(0);

	const closeSearchModal = (e) => {
		e.preventDefault()
		let searchModal = document.getElementsByClassName("search-modal")[0]
		searchModal.style.display = "none"
	}

	const searchToPage2 = (e) => {
		let input_section; let searchResultUrl;
		setSearchResult([])
		if (searchPage === 0) {
			input_section = document.getElementsByClassName("search-modal-content-page1-input")[0]
			setKeyword(input_section.value)
			searchResultUrl = "http://localhost:3002/search/" + input_section.value
		} else if (searchPage === 1) {
			input_section = document.getElementsByClassName("search-modal-content-page2-input")[0]
			setKeyword(input_section.value)
			searchResultUrl = "http://localhost:3002/search/" + input_section.value
		} else if (searchPage === 2) {
			input_section = document.getElementsByClassName("search-modal-content-page3-input")[0]
			setKeyword(input_section.value)
			searchResultUrl = "http://localhost:3002/search/" + input_section.value
		} else {
			setKeyword("")
			searchResultUrl = "http://localhost:3002/search/" + keyword
		}
		console.log(searchResultUrl)
		axios({
			method: "GET",
			url: searchResultUrl
		}).then((response) => {
			let search_result = JSON.parse(response.data.search_result)
			setSearchResult(search_result.items)
		})
		dispatch(ChangeSearchModalPage(1))
	}

	const searchToPage3 = (e) => {
		let page3_SearchResult = [searchResult[page3SearchResultPos], searchResult[page3SearchResultPos+1]]
		setpage3SearchResult(page3_SearchResult)
		dispatch(ChangeSearchModalPage(2))
	}

	const page3NextPage = (e) => {
		let page3_SearchResultPos = page3SearchResultPos + 2
		if (page3_SearchResultPos == 10){
			page3_SearchResultPos = 0
		}
		setPage3SearchResultPos(page3_SearchResultPos)
		let page3_SearchResult = [searchResult[page3SearchResultPos], searchResult[page3SearchResultPos+1]]
		setpage3SearchResult(page3_SearchResult)
		setCodeSnippets([])
		setCodeSnippetPos(0)
		setCodeSnippets2([])
		setCodeSnippetPos2(0)
		document.getElementsByClassName("search-code-snippet")[0].value = ""
		document.getElementsByClassName("search-code-snippet2")[0].value = ""
	}

	const page3PrevPage = (e) => {
		let page3_SearchResultPos = page3SearchResultPos - 2
		if (page3_SearchResultPos < 0){
			page3_SearchResultPos = 8
		}
		setPage3SearchResultPos(page3_SearchResultPos)
		let page3_SearchResult = [searchResult[page3SearchResultPos], searchResult[page3SearchResultPos+1]]
		setpage3SearchResult(page3_SearchResult)
		setCodeSnippets([])
		setCodeSnippetPos(0)
		setCodeSnippets2([])
		setCodeSnippetPos2(0)
		document.getElementsByClassName("search-code-snippet")[0].value = ""
		document.getElementsByClassName("search-code-snippet2")[0].value = ""
	}

	const backToPage1 = (e) => {
		dispatch(ChangeSearchModalPage(0))
	}

	const backToPage2 = (e) => {
		dispatch(ChangeSearchModalPage(1))
	}

	const getCodeSnippet = (e, result_link) => {
		let code_snippets = analyzeURL(result_link)
		code_snippets.then((result) => {
			console.log(result)
			setCodeSnippets(result)
			setCodeSnippetPos(0)
		})
	}
	const getCodeSnippet2 = (e, result_link) => {
		let code_snippets = analyzeURL(result_link)
		code_snippets.then((result) => {
			setCodeSnippets2(result)
			setCodeSnippetPos2(0)
		})
	}

	const codeSnippetNext = (e) => {
		let code_snippet_pos = codeSnippetPos + 1
		if (code_snippet_pos >= codeSnippets.length){
			code_snippet_pos = 0
		}
		setCodeSnippetPos(code_snippet_pos)
	}
	const codeSnippetPrev = (e) => {
		let code_snippet_pos = codeSnippetPos - 1
		if (code_snippet_pos < 0) {
			code_snippet_pos = codeSnippets.length - 1
		}
		setCodeSnippetPos(code_snippet_pos)
	}
	const codeSnippet2Next = (e) => {
		let code_snippet_pos = codeSnippetPos2 + 1
		if (code_snippet_pos >= codeSnippets2.length){
			code_snippet_pos = 0
		}
		setCodeSnippetPos2(code_snippet_pos)
	}
	const codeSnippet2Prev = (e) => {
		let code_snippet_pos = codeSnippetPos2 - 1
		if (code_snippet_pos < 0) {
			code_snippet_pos = codeSnippets2.length - 1
		}
		setCodeSnippetPos2(code_snippet_pos)
	}

	return(
		<div className="search-modal">
			<div className="search-modal-content">
				{searchPage === 0 &&
					<SearchModalPage1
						closeSearchModal={closeSearchModal}
						searchToPage2={searchToPage2}
					/>
				}
				{ searchPage === 1 &&
					<div className="search-modal-content-page2">
						<h6 className="search-modal-content-page2-title"
							onClick={(e) => backToPage1(e)}>
							検索
						</h6>
						<input type="text" className="search-modal-content-page2-input form-control" />
						<button className="btn btn-primary search-modal-content-page2-button"
								onClick={(e) => searchToPage2(e)}>
							検索する
						</button>
						<div className="search-modal-content-page2-close-button"
							 onClick={(e) => closeSearchModal(e)}>
							x
						</div>
						<hr />
						<p>「{keyword}」の 検索結果</p>
						<a  className="btn btn-primary"
							onClick={(e) => searchToPage3(e)}>
							２件検索を表示する
						</a>
						{searchResult.map((result) => {
							return(
								<div className="searchResultCard">
									<small>{result["link"]}</small>
									<h4>
										<a href={result["link"]}>
											{result["title"]}
										</a>
									</h4>
									{result["snippet"]}
									<br />
								</div>
							)
						})}
					</div>
				}
				{ searchPage === 2 &&
					<div className="search-modal-content-page3">
						<h6 className="search-modal-content-page3-title"
							onClick={(e) => backToPage1(e)}>
							検索
						</h6>
						<input type="text" className="search-modal-content-page3-input form-control" />
						<button className="btn btn-primary search-modal-content-page3-button"
								onClick={(e) => searchToPage2(e)}>
							検索する
						</button>
						<div className="search-modal-content-page3-close-button"
							 onClick={(e) => closeSearchModal(e)}>
							x
						</div>
						<hr />
						<p>「{keyword}」の 検索結果</p>
						<a  className="btn btn-primary"
							onClick={(e) => backToPage2(e)}>
							１０件検索を表示する
						</a>
						<div class="row page3SearchResult">
							<div className="col-1">
								<div className="page3PrevPage"
									 onClick={(e) => page3PrevPage(e)}>
									前へ
								</div>
							</div>
							{page3SearchResult.map((result, index) => {
								return(
									<div className="col-5 page3SearchResultCard">
										<h4>
											<a href={result["link"]}>
												{result["title"]}
											</a>
										</h4>
										<p className="page3SearchResultCard-snippet">
											{result["snippet"]}
										</p>
										{ index === 0 &&
											<textarea className="search-code-snippet form-control"
													  value={codeSnippets[codeSnippetPos]}>
											</textarea>
										}
										{ index === 1 &&
											<textarea className="search-code-snippet2 form-control"
													  value={codeSnippets2[codeSnippetPos2]}>
											</textarea>
										}
										{ index === 0 &&
											<div className="row">
												<div className="col-2"
													 onClick={(e) => codeSnippetPrev(e)}>
													 ＜
												</div>
												<div className="col-8 text-center"
													 onClick={(e) => getCodeSnippet(e, result["link"])}>
													<small>コードスニペット取得</small>
												</div>
												<div className="col-2"
													 onClick={(e) => codeSnippetNext(e)}>
													 ＞
												</div>
											</div>
										}
										{ index === 1 &&
											<div className="row">
												<div className="col-2"
													 onClick={(e) => codeSnippet2Prev(e)}>
													 ＜
												</div>
												<div className="col-8 text-center"
													 onClick={(e) => getCodeSnippet2(e, result["link"])}>
													<small>コードスニペット取得</small>
												</div>
												<div className="col-2"
													 onClick={(e) => codeSnippet2Next(e)}>
													 ＞
												</div>
											</div>
										}
									</div>
								)
							})}
							<div className="col-1">
								<div className="page3NextPage"
									 onClick={(e) => page3NextPage(e)}>
									次へ
								</div>
							</div>
						</div>
					</div>
				}
			</div>
		</div>
	)
}

export default SearchModal;