import React from "react"

const SearchModalPage1 = (props) => {
	return(
		<div className="search-modal-content-page1">
			<div className="search-modal-content-page1-close-button"
				 onClick={(e) => props.closeSearchModal(e)}>
				x
			</div>
			<h2 className="text-center search-modal-content-page1-title">検索する</h2>
			<input type="text" className="form-control search-modal-content-page1-input" />
			<button className="btn btn-primary search-modal-content-page1-button"
					onClick={(e) => props.searchToPage2(e)}
			>
				検索する
			</button>
		</div>
	)
}

export default SearchModalPage1;